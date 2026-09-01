const rhs = 'rhs(i) = .vv ? vs1[i] : .vx/.vf ? scalar(rs1) : sign_extend(imm)'

function elementwise(expression, setup = rhs) {
  return `${setup}
for i = vstart .. vl - 1:
    if vm == 1 or v0.mask[i] == 1:
        vd[i] = ${expression}
    else:
        vd[i] = vma ? agnostic : old_vd[i]
for i = vl .. VLMAX - 1:
    vd[i] = vta ? agnostic : old_vd[i]
vstart = 0`
}

function maskwise(predicate, setup = rhs) {
  return `${setup}
for i = vstart .. vl - 1:
    if vm == 1 or v0.mask[i] == 1:
        vd.mask[i] = ${predicate} ? 1 : 0
    else:
        vd.mask[i] = vma ? agnostic : old_vd.mask[i]
# 掩码结果的尾部位总是 tail-agnostic
vstart = 0`
}

function unmaskedElementwise(expression, setup = rhs) {
  return `${setup}
for i = vstart .. vl - 1:
    vd[i] = ${expression}
for i = vl .. VLMAX - 1:
    vd[i] = vta ? agnostic : old_vd[i]
vstart = 0`
}

function unmaskedMaskwise(expression, setup) {
  return `${setup}
for i = vstart .. vl - 1:
    vd.mask[i] = ${expression}
# 掩码结果的尾部位总是 tail-agnostic
vstart = 0`
}

function saturatingElementwise(expression, setup = rhs) {
  return elementwise(expression, setup).replace(
    'vstart = 0',
    'if any active result saturated: vxsat = 1\nvstart = 0',
  )
}

function reduction(op, { float = false, ordered = false, wide = false } = {}) {
  const type = float ? (wide ? '2*SEW 浮点格式' : 'SEW 浮点格式') : (wide ? '2*SEW 整数' : 'SEW 整数')
  const order = ordered ? '严格按元素索引顺序' : '实现允许按规范构造任意归约树'
  return `if vstart != 0: illegal_instruction
acc = convert(vs1[0], ${type})
# ${order}
for i = 0 .. vl - 1:
    if vm == 1 or v0.mask[i] == 1:
        acc = ${op}(acc, convert(vs2[i], ${type}))
vd[0] = acc
vd[1 .. VLMAX-1] = tail_agnostic
vstart = 0`
}

function memoryPseudocode(kind) {
  let match = kind.match(/^vl([1248])re(8|16|32|64)$/)
  if (match) {
    const [, nf, eew] = match
    return `# 整寄存器加载忽略当前 vl 与 vtype；传送 ${nf} × VLEN 位
for byte = vstart * (${eew} / 8) .. (${nf} * VLEN / 8) - 1:
    vd_group.byte[byte] = MEM8[x[rs1] + byte]
vstart = 0`
  }

  match = kind.match(/^vs([1248])r$/)
  if (match) return `# 整寄存器存储按 EEW=8 编码，忽略当前 vl 与 vtype；传送 ${match[1]} × VLEN 位
for byte = vstart .. (${match[1]} * VLEN / 8) - 1:
    MEM8[x[rs1] + byte] = vs3_group.byte[byte]
vstart = 0`

  if (kind === 'vlm') return `evl = ceil(vl / 8)
# 掩码加载按 EEW=8 执行，因此 vstart 是打包后的字节索引
for byte = vstart .. evl - 1:
    packed = MEM8[x[rs1] + byte]
    for bit = 0 .. 7:
        if 8 * byte + bit < vl: vd.mask[8 * byte + bit] = packed[bit]
vd.mask[vl .. VLEN-1] = tail_agnostic
vstart = 0`
  if (kind === 'vsm') return `evl = ceil(vl / 8)
# 掩码存储按 EEW=8 执行，因此 vstart 是打包后的字节索引
for byte = vstart .. evl - 1:
    MEM8[x[rs1] + byte] = pack_bits(vs3.mask[8*byte .. 8*byte+7])
vstart = 0`

  match = kind.match(/^vle(8|16|32|64)(ff)?$/)
  if (match) {
    const [, eew, faultOnlyFirst] = match
    const fault = faultOnlyFirst
      ? `    if access_fault and i is the first active element: trap
    if access_fault after the first active element: vl = i; stop without trap`
      : '    if access_fault: vstart = i; trap'
    return `for i = vstart .. vl - 1:
    if vm == 0 and v0.mask[i] == 0: continue
    address = x[rs1] + i * (${eew} / 8)
${fault}
    vd[i] = zero_extend(MEM${eew}[address])
apply_load_mask_and_tail_policy(vd, vl, vma, vta)
vstart = 0`
  }

  match = kind.match(/^vse(8|16|32|64)$/)
  if (match) return `for i = vstart .. vl - 1:
    if vm == 0 and v0.mask[i] == 0: continue
    address = x[rs1] + i * (${match[1]} / 8)
    MEM${match[1]}[address] = low_${match[1]}_bits(vs3[i])
vstart = 0`

  match = kind.match(/^vlse(8|16|32|64)$/)
  if (match) return `for i = vstart .. vl - 1:
    if vm == 0 and v0.mask[i] == 0: continue
    address = x[rs1] + i * sign_extend(x[rs2])
    vd[i] = zero_extend(MEM${match[1]}[address])
apply_load_mask_and_tail_policy(vd, vl, vma, vta)
vstart = 0`

  match = kind.match(/^vsse(8|16|32|64)$/)
  if (match) return `for i = vstart .. vl - 1:
    if vm == 0 and v0.mask[i] == 0: continue
    address = x[rs1] + i * sign_extend(x[rs2])
    MEM${match[1]}[address] = low_${match[1]}_bits(vs3[i])
vstart = 0`

  match = kind.match(/^v(l|s)(s?)seg([2-8])e(8|16|32|64)$/)
  if (match) {
    const [, direction, strided, nf, eew] = match
    const address = strided
      ? `x[rs1] + i * sign_extend(x[rs2]) + field * (${eew} / 8)`
      : `x[rs1] + (i * ${nf} + field) * (${eew} / 8)`
    const access = direction === 'l'
      ? `vd_field[field][i] = zero_extend(MEM${eew}[address])`
      : `MEM${eew}[address] = low_${eew}_bits(vs3_field[field][i])`
    const policy = direction === 'l' ? '\napply_load_mask_and_tail_policy(vd_fields, vl, vma, vta)' : ''
    return `for i = vstart .. vl - 1:
    if vm == 0 and v0.mask[i] == 0: continue
    for field = 0 .. ${nf} - 1:
        address = ${address}
        ${access}${policy}
vstart = 0`
  }

  match = kind.match(/^v(lux|lox|sux|sox)(?:seg([2-8]))?ei(8|16|32|64)$/)
  if (match) {
    const [, mode, nfText, indexEew] = match
    const nf = Number(nfText || 1)
    const load = mode[0] === 'l'
    const ordered = mode === 'lox' || mode === 'sox'
    const data = load
      ? `vd_field[field][i] = MEM_SEW[address]`
      : `MEM_SEW[address] = vs3_field[field][i]`
    const fieldLoop = nf === 1 ? 'field = 0' : `for field = 0 .. ${nf} - 1:`
    const indent = nf === 1 ? '    ' : '        '
    const policy = load ? '\napply_load_mask_and_tail_policy(vd_fields, vl, vma, vta)' : ''
    return `# 元素访问${ordered ? '必须按 i 的顺序被观察' : '之间没有顺序保证'}；索引按 ${indexEew} 位无符号偏移解释
for i = vstart .. vl - 1:
    if vm == 0 and v0.mask[i] == 0: continue
    ${fieldLoop}
${indent}address = x[rs1] + zero_extend(vs2[i]) + field * (SEW / 8)
${indent}${data}${policy}
vstart = 0`
  }

  return undefined
}

const direct = {
  vadd: () => elementwise('wrap_SEW(vs2[i] + rhs(i))'),
  vsub: () => elementwise('wrap_SEW(vs2[i] - rhs(i))'),
  vrsub: () => elementwise('wrap_SEW(rhs(i) - vs2[i])'),
  vand: () => elementwise('vs2[i] & rhs(i)'),
  vor: () => elementwise('vs2[i] | rhs(i)'),
  vxor: () => elementwise('vs2[i] ^ rhs(i)'),
  vsll: () => elementwise('vs2[i] << (rhs(i) & (SEW - 1))'),
  vsrl: () => elementwise('unsigned(vs2[i]) >> (rhs(i) & (SEW - 1))'),
  vsra: () => elementwise('signed(vs2[i]) >> (rhs(i) & (SEW - 1))'),
  vmin: () => elementwise('signed_min(vs2[i], rhs(i))'),
  vminu: () => elementwise('unsigned_min(vs2[i], rhs(i))'),
  vmax: () => elementwise('signed_max(vs2[i], rhs(i))'),
  vmaxu: () => elementwise('unsigned_max(vs2[i], rhs(i))'),
  vmul: () => elementwise('low_SEW_bits(vs2[i] * rhs(i))'),
  vmulh: () => elementwise('high_SEW_bits(signed(vs2[i]) * signed(rhs(i)))'),
  vmulhu: () => elementwise('high_SEW_bits(unsigned(vs2[i]) * unsigned(rhs(i)))'),
  vmulhsu: () => elementwise('high_SEW_bits(signed(vs2[i]) * unsigned(rhs(i)))'),
  vdiv: () => elementwise('signed_divide_with_RISC_V_edge_cases(vs2[i], rhs(i))'),
  vdivu: () => elementwise('unsigned_divide_or_all_ones_on_zero(vs2[i], rhs(i))'),
  vrem: () => elementwise('signed_remainder_with_RISC_V_edge_cases(vs2[i], rhs(i))'),
  vremu: () => elementwise('unsigned_remainder_or_dividend_on_zero(vs2[i], rhs(i))'),
  vsadd: () => saturatingElementwise('signed_saturate_SEW(signed(vs2[i]) + signed(rhs(i)))'),
  vsaddu: () => saturatingElementwise('unsigned_saturate_SEW(unsigned(vs2[i]) + unsigned(rhs(i)))'),
  vssub: () => saturatingElementwise('signed_saturate_SEW(signed(vs2[i]) - signed(rhs(i)))'),
  vssubu: () => saturatingElementwise('unsigned_saturate_SEW(unsigned(vs2[i]) - unsigned(rhs(i)))'),
  vaadd: () => elementwise('round_shift_signed(vs2[i] + rhs(i), 1, vxrm)'),
  vaaddu: () => elementwise('round_shift_unsigned(vs2[i] + rhs(i), 1, vxrm)'),
  vasub: () => elementwise('round_shift_signed(vs2[i] - rhs(i), 1, vxrm)'),
  vasubu: () => elementwise('round_shift_unsigned(vs2[i] - rhs(i), 1, vxrm)'),
  vssrl: () => elementwise('round_shift_unsigned(vs2[i], rhs(i) & (SEW - 1), vxrm)'),
  vssra: () => elementwise('round_shift_signed(vs2[i], rhs(i) & (SEW - 1), vxrm)'),
  vsmul: () => saturatingElementwise('signed_saturate_SEW(round_shift_signed(vs2[i] * rhs(i), SEW-1, vxrm))'),
  vnclip: () => saturatingElementwise('signed_saturate_SEW(round_shift_signed(wide(vs2[i]), rhs(i), vxrm))'),
  vnclipu: () => saturatingElementwise('unsigned_saturate_SEW(round_shift_unsigned(wide(vs2[i]), rhs(i), vxrm))'),
  vnsrl: () => elementwise('low_SEW_bits(unsigned(wide(vs2[i])) >> (rhs(i) & (2*SEW-1)))'),
  vnsra: () => elementwise('low_SEW_bits(signed(wide(vs2[i])) >> (rhs(i) & (2*SEW-1)))'),
  vsext: () => elementwise('sign_extend_SEW(vs2_narrow[i])', '# .vf2/.vf4/.vf8 selects source width SEW/2, SEW/4, or SEW/8'),
  vzext: () => elementwise('zero_extend_SEW(vs2_narrow[i])', '# .vf2/.vf4/.vf8 selects source width SEW/2, SEW/4, or SEW/8'),
  vadc: () => unmaskedElementwise('wrap_SEW(vs2[i] + rhs(i) + v0.mask[i])', `${rhs}\n# v0 supplies carry-in and is not an execution mask`),
  vsbc: () => unmaskedElementwise('wrap_SEW(vs2[i] - rhs(i) - v0.mask[i])', `${rhs}\n# v0 supplies borrow-in and is not an execution mask`),
  vmadc: () => unmaskedMaskwise('unsigned(vs2[i]) + unsigned(rhs(i)) + carry_in(i) > MAXU(SEW)', `${rhs}\ncarry_in(i) = form_has_v0 ? v0.mask[i] : 0\n# v0 is carry-in, never an execution mask`),
  vmsbc: () => unmaskedMaskwise('unsigned(vs2[i]) < unsigned(rhs(i)) + borrow_in(i)', `${rhs}\nborrow_in(i) = form_has_v0 ? v0.mask[i] : 0\n# v0 is borrow-in, never an execution mask`),
  vmacc: () => elementwise('wrap_SEW(vd[i] + mul1(i) * vs2[i])', 'mul1(i) = .vv ? vs1[i] : scalar(rs1)'),
  vnmsac: () => elementwise('wrap_SEW(vd[i] - mul1(i) * vs2[i])', 'mul1(i) = .vv ? vs1[i] : scalar(rs1)'),
  vmadd: () => elementwise('wrap_SEW(mul1(i) * vd[i] + vs2[i])', 'mul1(i) = .vv ? vs1[i] : scalar(rs1)'),
  vnmsub: () => elementwise('wrap_SEW(vs2[i] - mul1(i) * vd[i])', 'mul1(i) = .vv ? vs1[i] : scalar(rs1)'),
  vwadd: () => elementwise('signed_to_2SEW(vs2[i]) + signed_to_2SEW(rhs(i))'),
  vwaddu: () => elementwise('unsigned_to_2SEW(vs2[i]) + unsigned_to_2SEW(rhs(i))'),
  vwsub: () => elementwise('signed_to_2SEW(vs2[i]) - signed_to_2SEW(rhs(i))'),
  vwsubu: () => elementwise('unsigned_to_2SEW(vs2[i]) - unsigned_to_2SEW(rhs(i))'),
  vwmul: () => elementwise('signed_widen(vs2[i]) * signed_widen(rhs(i))'),
  vwmulu: () => elementwise('unsigned_widen(vs2[i]) * unsigned_widen(rhs(i))'),
  vwmulsu: () => elementwise('signed_widen(vs2[i]) * unsigned_widen(rhs(i))'),
  vwmacc: () => elementwise('vd_wide[i] + signed(vs1[i]) * signed(vs2[i])'),
  vwmaccu: () => elementwise('vd_wide[i] + unsigned(vs1[i]) * unsigned(vs2[i])'),
  vwmaccsu: () => elementwise('vd_wide[i] + signed(vs1[i]) * unsigned(vs2[i])'),
  vwmaccus: () => elementwise('vd_wide[i] + unsigned_scalar(rs1) * signed(vs2[i])', '# .vx form only'),
  vmseq: () => maskwise('vs2[i] == rhs(i)'),
  vmsne: () => maskwise('vs2[i] != rhs(i)'),
  vmslt: () => maskwise('signed(vs2[i]) < signed(rhs(i))'),
  vmsltu: () => maskwise('unsigned(vs2[i]) < unsigned(rhs(i))'),
  vmsle: () => maskwise('signed(vs2[i]) <= signed(rhs(i))'),
  vmsleu: () => maskwise('unsigned(vs2[i]) <= unsigned(rhs(i))'),
  vmsgt: () => maskwise('signed(vs2[i]) > signed(rhs(i))'),
  vmsgtu: () => maskwise('unsigned(vs2[i]) > unsigned(rhs(i))'),
  vfadd: () => elementwise('fp_add(vs2[i], rhs(i), frm)'),
  vfsub: () => elementwise('fp_sub(vs2[i], rhs(i), frm)'),
  vfrsub: () => elementwise('fp_sub(fp_scalar(rs1), vs2[i], frm)', '# .vf form'),
  vfmul: () => elementwise('fp_mul(vs2[i], rhs(i), frm)'),
  vfdiv: () => elementwise('fp_div(vs2[i], rhs(i), frm)'),
  vfrdiv: () => elementwise('fp_div(fp_scalar(rs1), vs2[i], frm)', '# .vf form'),
  vfsqrt: () => elementwise('fp_sqrt(vs2[i], frm)', '# unary operation'),
  vfmin: () => elementwise('fp_minimumNumber(vs2[i], rhs(i))'),
  vfmax: () => elementwise('fp_maximumNumber(vs2[i], rhs(i))'),
  vfsgnj: () => elementwise('magnitude(vs2[i]) | sign(rhs(i))'),
  vfsgnjn: () => elementwise('magnitude(vs2[i]) | not(sign(rhs(i)))'),
  vfsgnjx: () => elementwise('magnitude(vs2[i]) | (sign(vs2[i]) xor sign(rhs(i)))'),
  vfclass: () => elementwise('classify_to_10_bit_mask(vs2[i])', '# unary operation; does not raise floating-point exceptions'),
  vfrec7: () => elementwise('reciprocal_estimate_7_bits(vs2[i])', '# unary approximation'),
  vfrsqrt7: () => elementwise('reciprocal_sqrt_estimate_7_bits(vs2[i])', '# unary approximation'),
  vfmacc: () => elementwise('fused(mul1(i) * vs2[i] + vd[i])', 'mul1(i) = .vv ? vs1[i] : fp_scalar(rs1)'),
  vfnmacc: () => elementwise('fused(-(mul1(i) * vs2[i]) - vd[i])', 'mul1(i) = .vv ? vs1[i] : fp_scalar(rs1)'),
  vfmsac: () => elementwise('fused(mul1(i) * vs2[i] - vd[i])', 'mul1(i) = .vv ? vs1[i] : fp_scalar(rs1)'),
  vfnmsac: () => elementwise('fused(-(mul1(i) * vs2[i]) + vd[i])', 'mul1(i) = .vv ? vs1[i] : fp_scalar(rs1)'),
  vfmadd: () => elementwise('fused(mul1(i) * vd[i] + vs2[i])', 'mul1(i) = .vv ? vs1[i] : fp_scalar(rs1)'),
  vfnmadd: () => elementwise('fused(-(mul1(i) * vd[i]) - vs2[i])', 'mul1(i) = .vv ? vs1[i] : fp_scalar(rs1)'),
  vfmsub: () => elementwise('fused(mul1(i) * vd[i] - vs2[i])', 'mul1(i) = .vv ? vs1[i] : fp_scalar(rs1)'),
  vfnmsub: () => elementwise('fused(-(mul1(i) * vd[i]) + vs2[i])', 'mul1(i) = .vv ? vs1[i] : fp_scalar(rs1)'),
  vfwadd: () => elementwise('fp_to_2SEW(vs2[i]) + fp_to_2SEW(rhs(i))'),
  vfwsub: () => elementwise('fp_to_2SEW(vs2[i]) - fp_to_2SEW(rhs(i))'),
  vfwmul: () => elementwise('fp_widen(vs2[i]) * fp_widen(rhs(i))'),
  vfwmacc: () => elementwise('fused(fp_widen(mul1(i)) * fp_widen(vs2[i]) + vd_wide[i])', 'mul1(i) = .vv ? vs1[i] : fp_scalar(rs1)'),
  vfwnmacc: () => elementwise('fused(-(fp_widen(mul1(i)) * fp_widen(vs2[i])) - vd_wide[i])', 'mul1(i) = .vv ? vs1[i] : fp_scalar(rs1)'),
  vfwmsac: () => elementwise('fused(fp_widen(mul1(i)) * fp_widen(vs2[i]) - vd_wide[i])', 'mul1(i) = .vv ? vs1[i] : fp_scalar(rs1)'),
  vfwnmsac: () => elementwise('fused(-(fp_widen(mul1(i)) * fp_widen(vs2[i])) + vd_wide[i])', 'mul1(i) = .vv ? vs1[i] : fp_scalar(rs1)'),
  vmfeq: () => maskwise('fp_quiet_equal(vs2[i], rhs(i))'),
  vmfne: () => maskwise('not(fp_quiet_equal(vs2[i], rhs(i)))'),
  vmflt: () => maskwise('fp_signaling_less(vs2[i], rhs(i))'),
  vmfle: () => maskwise('fp_signaling_less_equal(vs2[i], rhs(i))'),
  vmfgt: () => maskwise('fp_signaling_less(rhs(i), vs2[i])', '# .vf form'),
  vmfge: () => maskwise('fp_signaling_less_equal(rhs(i), vs2[i])', '# .vf form'),
  vfcvt: () => elementwise('convert_same_width(vs2[i], selected .xu/.x/.f form, frm or rtz)'),
  vfwcvt: () => elementwise('convert_to_2x_width(vs2[i], selected .xu/.x/.f form, frm or rtz)'),
  vfncvt: () => elementwise('convert_to_half_width(vs2_wide[i], selected .xu/.x/.f/.rod form, frm or rtz)'),
  vfmv: () => elementwise('bit_preserving_fp_scalar(rs1)', '# vfmv.v.f broadcasts one floating-point scalar'),
  'vfmv-s-f': () => `vd[0] = bit_preserving_fp_scalar(rs1)\n# vd[1..] and all sources remain unchanged\nvstart = 0`,
  'vfmv-f-s': () => `f[rd] = nan_box_if_needed(vs2[0])\n# vector registers remain unchanged\nvstart = 0`,
  vfmerge: () => `for i = vstart .. vl - 1:\n    vd[i] = v0.mask[i] ? fp_scalar(rs1) : vs2[i]\napply_tail_policy(vd, vl, vta)\nvstart = 0`,
  vmv: () => unmaskedElementwise('selected_source(i)', 'selected_source(i) = .v.v ? vs1[i] : .v.x ? sign_extend(x[rs1]) : sign_extend(imm)\n# vmv forms are unmasked'),
  'vmv-s-x': () => `vd[0] = low_SEW_bits(x[rs1])\n# vd[1..] and all sources remain unchanged\nvstart = 0`,
  'vmv-x-s': () => `x[rd] = sign_extend_XLEN(vs2[0])\n# vector registers remain unchanged\nvstart = 0`,
  vid: () => elementwise('i', '# each active element receives its own index'),
  viota: () => `if vstart != 0: illegal_instruction
count = 0
for i = 0 .. vl - 1:
    if vm == 1 or v0.mask[i] == 1:
        vd[i] = count
        if vs2.mask[i] == 1: count += 1
apply_mask_and_tail_policy(vd, vl, vma, vta)
vstart = 0`,
  vmerge: () => `rhs(i) = .vvm ? vs1[i] : .vxm ? scalar(rs1) : sign_extend(imm)
for i = vstart .. vl - 1:
    vd[i] = v0.mask[i] ? rhs(i) : vs2[i]
apply_tail_policy(vd, vl, vta)
vstart = 0`,
  vrgather: () => elementwise('unsigned(index(i)) >= VLMAX ? 0 : vs2[unsigned(index(i))]', 'index(i) = .vv ? vs1[i] : .vx ? x[rs1] : zero_extend(imm)'),
  vrgatherei16: () => elementwise('zero_extend(vs1[i]) >= VLMAX ? 0 : vs2[zero_extend(vs1[i])]', '# vs1 contains 16-bit unsigned indices'),
  vslideup: () => elementwise('i < offset ? old_vd[i] : vs2[i - offset]', 'offset = unsigned(.vx ? x[rs1] : imm)\n# destination elements below offset are unchanged'),
  vslidedown: () => elementwise('i + offset < VLMAX ? vs2[i + offset] : 0', 'offset = unsigned(.vx ? x[rs1] : imm)'),
  vslide1up: () => elementwise('i == 0 ? scalar(rs1) : vs2[i - 1]', '# integer scalar is inserted at element 0'),
  vslide1down: () => elementwise('i == vl - 1 ? scalar(rs1) : vs2[i + 1]', '# integer scalar is inserted at element vl-1'),
  vfslide1up: () => elementwise('i == 0 ? fp_scalar(rs1) : vs2[i - 1]', '# floating-point scalar is inserted at element 0'),
  vfslide1down: () => elementwise('i == vl - 1 ? fp_scalar(rs1) : vs2[i + 1]', '# floating-point scalar is inserted at element vl-1'),
  vcompress: () => `if vstart != 0: illegal_instruction
j = 0
for i = 0 .. vl - 1:
    if vs1.mask[i] == 1: vd[j] = vs2[i]; j += 1
vd[j .. VLMAX-1] = tail_agnostic
vstart = 0`,
  vcpop: () => `if vstart != 0: illegal_instruction
count = 0
for i = 0 .. vl - 1:
    if (vm == 1 or v0.mask[i] == 1) and vs2.mask[i] == 1: count += 1
x[rd] = count
vstart = 0`,
  vfirst: () => `if vstart != 0: illegal_instruction
x[rd] = -1
for i = 0 .. vl - 1:
    if (vm == 1 or v0.mask[i] == 1) and vs2.mask[i] == 1:
        x[rd] = i; break
vstart = 0`,
  vmand: () => unmaskedMaskwise('vs2.mask[i] & vs1.mask[i]', '# mask logical operation; no execution mask'),
  vmnand: () => unmaskedMaskwise('not(vs2.mask[i] & vs1.mask[i])', '# mask logical operation; no execution mask'),
  vmandn: () => unmaskedMaskwise('vs2.mask[i] & not(vs1.mask[i])', '# mask logical operation; no execution mask'),
  vmxor: () => unmaskedMaskwise('vs2.mask[i] xor vs1.mask[i]', '# mask logical operation; no execution mask'),
  vmor: () => unmaskedMaskwise('vs2.mask[i] | vs1.mask[i]', '# mask logical operation; no execution mask'),
  vmnor: () => unmaskedMaskwise('not(vs2.mask[i] | vs1.mask[i])', '# mask logical operation; no execution mask'),
  vmorn: () => unmaskedMaskwise('vs2.mask[i] | not(vs1.mask[i])', '# mask logical operation; no execution mask'),
  vmxnor: () => unmaskedMaskwise('not(vs2.mask[i] xor vs1.mask[i])', '# mask logical operation; no execution mask'),
  vmsbf: () => `if vstart != 0: illegal_instruction\nfound = false\nfor i = 0 .. vl - 1:\n    if not active(i): vd.mask[i] = vma ? agnostic : old_vd.mask[i]\n    else: vd.mask[i] = not(found) and not(vs2.mask[i])\n    if active(i) and vs2.mask[i]: found = true\nmask_tail(vd) = agnostic\nvstart = 0`,
  vmsif: () => `if vstart != 0: illegal_instruction\nfound = false\nfor i = 0 .. vl - 1:\n    if not active(i): vd.mask[i] = vma ? agnostic : old_vd.mask[i]\n    else: vd.mask[i] = not(found)\n    if active(i) and vs2.mask[i]: found = true\nmask_tail(vd) = agnostic\nvstart = 0`,
  vmsof: () => `if vstart != 0: illegal_instruction\nfound = false\nfor i = 0 .. vl - 1:\n    if not active(i): vd.mask[i] = vma ? agnostic : old_vd.mask[i]\n    else: vd.mask[i] = not(found) and vs2.mask[i]\n    if active(i) and vs2.mask[i]: found = true\nmask_tail(vd) = agnostic\nvstart = 0`,
  vredsum: () => reduction('wrap_add'),
  vredand: () => reduction('bit_and'),
  vredor: () => reduction('bit_or'),
  vredxor: () => reduction('bit_xor'),
  vredmin: () => reduction('signed_min'),
  vredminu: () => reduction('unsigned_min'),
  vredmax: () => reduction('signed_max'),
  vredmaxu: () => reduction('unsigned_max'),
  vwredsum: () => reduction('signed_wide_add', { wide: true }),
  vwredsumu: () => reduction('unsigned_wide_add', { wide: true }),
  vfredosum: () => reduction('fp_add', { float: true, ordered: true }),
  vfredusum: () => reduction('fp_add', { float: true }),
  vfredmin: () => reduction('fp_minimumNumber', { float: true }),
  vfredmax: () => reduction('fp_maximumNumber', { float: true }),
  vfwredosum: () => reduction('fp_add', { float: true, wide: true, ordered: true }),
  vfwredusum: () => reduction('fp_add', { float: true, wide: true }),
  vsetvli: () => `AVL = (rs1 == x0) ? special_AVL_rule(rd, old_vl) : x[rs1]
requested_vtype = zero_extend(vtypei)
(vl, vtype) = select_vl_and_validate_vtype(AVL, requested_vtype)
x[rd] = vl                 # rd=x0 discards this write
vstart = 0`,
  vsetivli: () => `AVL = zero_extend(uimm[4:0])
requested_vtype = zero_extend(vtypei)
(vl, vtype) = select_vl_and_validate_vtype(AVL, requested_vtype)
x[rd] = vl                 # rd=x0 discards this write
vstart = 0`,
  vsetvl: () => `AVL = (rs1 == x0) ? special_AVL_rule(rd, old_vl) : x[rs1]
requested_vtype = x[rs2]
(vl, vtype) = select_vl_and_validate_vtype(AVL, requested_vtype)
x[rd] = vl                 # rd=x0 discards this write
vstart = 0`,
}

for (const count of [1, 2, 4, 8]) {
  direct[`vmv${count}r`] = () => `# 整寄存器组复制忽略 vl、vtype 与执行掩码
for bit = 0 .. ${count} * VLEN - 1:
    vd_group.bit[bit] = vs2_group.bit[bit]
vstart = 0`
}

export function getRiscvPseudocode(kind) {
  const normalized = String(kind).toLowerCase()
  const memory = memoryPseudocode(normalized)
  if (memory) return memory
  const factory = direct[normalized]
  return factory ? factory() : undefined
}
