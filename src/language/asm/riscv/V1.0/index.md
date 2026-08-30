---
cover: riscv
date: 2026-08-30
topic: "汇编与系统"
---

# RISC-V V 1.0 指令全集

共收录 441 个独立助记符页面；每页均包含 `InstructionSlots` 与 `RegisterOperation`。

## 合并与滑动

- [vfslide1down](./vfslide1down)
- [vfslide1up](./vfslide1up)
- [vmerge](./vmerge)
- [vslide1down](./vslide1down)
- [vslide1up](./vslide1up)
- [vslidedown](./vslidedown)
- [vslideup](./vslideup)

## configuration

- [vsetivli](./configuration/vsetivli)
- [vsetvl](./configuration/vsetvl)
- [vsetvli](./configuration/vsetvli)

## fixed-point/averaging-add-sub

- [vaadd](./fixed-point/averaging-add-sub/vaadd)
- [vaaddu](./fixed-point/averaging-add-sub/vaaddu)
- [vasub](./fixed-point/averaging-add-sub/vasub)
- [vasubu](./fixed-point/averaging-add-sub/vasubu)

## fixed-point/clip

- [vnclip](./fixed-point/clip/vnclip)
- [vnclipu](./fixed-point/clip/vnclipu)

## fixed-point/fractional-multiply

- [vsmul](./fixed-point/fractional-multiply/vsmul)

## fixed-point/saturating-add-sub

- [vsadd](./fixed-point/saturating-add-sub/vsadd)
- [vsaddu](./fixed-point/saturating-add-sub/vsaddu)
- [vssub](./fixed-point/saturating-add-sub/vssub)
- [vssubu](./fixed-point/saturating-add-sub/vssubu)

## fixed-point/scaling-shift

- [vssra](./fixed-point/scaling-shift/vssra)
- [vssrl](./fixed-point/scaling-shift/vssrl)

## floating-point/add-sub

- [vfadd](./floating-point/add-sub/vfadd)
- [vfrsub](./floating-point/add-sub/vfrsub)
- [vfsub](./floating-point/add-sub/vfsub)

## floating-point/classify

- [vfclass](./floating-point/classify/vfclass)

## floating-point/compare

- [vmfeq](./floating-point/compare/vmfeq)
- [vmfge](./floating-point/compare/vmfge)
- [vmfgt](./floating-point/compare/vmfgt)
- [vmfle](./floating-point/compare/vmfle)
- [vmflt](./floating-point/compare/vmflt)
- [vmfne](./floating-point/compare/vmfne)

## floating-point/convert

- [vfcvt](./floating-point/convert/vfcvt)

## floating-point/fma

- [vfmacc](./floating-point/fma/vfmacc)
- [vfmadd](./floating-point/fma/vfmadd)
- [vfmsac](./floating-point/fma/vfmsac)
- [vfmsub](./floating-point/fma/vfmsub)
- [vfnmacc](./floating-point/fma/vfnmacc)
- [vfnmadd](./floating-point/fma/vfnmadd)
- [vfnmsac](./floating-point/fma/vfnmsac)
- [vfnmsub](./floating-point/fma/vfnmsub)

## floating-point/merge

- [vfmerge](./floating-point/merge/vfmerge)

## floating-point/min-max

- [vfmax](./floating-point/min-max/vfmax)
- [vfmin](./floating-point/min-max/vfmin)

## floating-point/move

- [vfmv](./floating-point/move/vfmv)

## floating-point/multiply-divide

- [vfdiv](./floating-point/multiply-divide/vfdiv)
- [vfmul](./floating-point/multiply-divide/vfmul)
- [vfrdiv](./floating-point/multiply-divide/vfrdiv)

## floating-point/narrowing-convert

- [vfncvt](./floating-point/narrowing-convert/vfncvt)

## floating-point/reciprocal-estimate

- [vfrec7](./floating-point/reciprocal-estimate/vfrec7)

## floating-point/reciprocal-sqrt-estimate

- [vfrsqrt7](./floating-point/reciprocal-sqrt-estimate/vfrsqrt7)

## floating-point/sign-injection

- [vfsgnj](./floating-point/sign-injection/vfsgnj)
- [vfsgnjn](./floating-point/sign-injection/vfsgnjn)
- [vfsgnjx](./floating-point/sign-injection/vfsgnjx)

## floating-point/sqrt

- [vfsqrt](./floating-point/sqrt/vfsqrt)

## floating-point/widening-add-sub

- [vfwadd](./floating-point/widening-add-sub/vfwadd)
- [vfwsub](./floating-point/widening-add-sub/vfwsub)

## floating-point/widening-convert

- [vfwcvt](./floating-point/widening-convert/vfwcvt)

## floating-point/widening-fma

- [vfwmacc](./floating-point/widening-fma/vfwmacc)
- [vfwmsac](./floating-point/widening-fma/vfwmsac)
- [vfwnmacc](./floating-point/widening-fma/vfwnmacc)
- [vfwnmsac](./floating-point/widening-fma/vfwnmsac)

## floating-point/widening-multiply

- [vfwmul](./floating-point/widening-multiply/vfwmul)

## integer/add-sub

- [vadd](./integer/add-sub/vadd)
- [vrsub](./integer/add-sub/vrsub)
- [vsub](./integer/add-sub/vsub)

## integer/carry-borrow

- [vadc](./integer/carry-borrow/vadc)
- [vmadc](./integer/carry-borrow/vmadc)
- [vmsbc](./integer/carry-borrow/vmsbc)
- [vsbc](./integer/carry-borrow/vsbc)

## integer/compare

- [vmseq](./integer/compare/vmseq)
- [vmsgt](./integer/compare/vmsgt)
- [vmsgtu](./integer/compare/vmsgtu)
- [vmsle](./integer/compare/vmsle)
- [vmsleu](./integer/compare/vmsleu)
- [vmslt](./integer/compare/vmslt)
- [vmsltu](./integer/compare/vmsltu)
- [vmsne](./integer/compare/vmsne)

## integer/divide

- [vdiv](./integer/divide/vdiv)
- [vdivu](./integer/divide/vdivu)
- [vrem](./integer/divide/vrem)
- [vremu](./integer/divide/vremu)

## integer/extension

- [vsext](./integer/extension/vsext)
- [vzext](./integer/extension/vzext)

## integer/logical

- [vand](./integer/logical/vand)
- [vor](./integer/logical/vor)
- [vxor](./integer/logical/vxor)

## integer/min-max

- [vmax](./integer/min-max/vmax)
- [vmaxu](./integer/min-max/vmaxu)
- [vmin](./integer/min-max/vmin)
- [vminu](./integer/min-max/vminu)

## integer/move

- [vmv](./integer/move/vmv)

## integer/multiply

- [vmul](./integer/multiply/vmul)
- [vmulh](./integer/multiply/vmulh)
- [vmulhsu](./integer/multiply/vmulhsu)
- [vmulhu](./integer/multiply/vmulhu)

## integer/multiply-add

- [vmacc](./integer/multiply-add/vmacc)
- [vmadd](./integer/multiply-add/vmadd)
- [vnmsac](./integer/multiply-add/vnmsac)
- [vnmsub](./integer/multiply-add/vnmsub)

## integer/narrowing-shift

- [vnsra](./integer/narrowing-shift/vnsra)
- [vnsrl](./integer/narrowing-shift/vnsrl)

## integer/shift

- [vsll](./integer/shift/vsll)
- [vsra](./integer/shift/vsra)
- [vsrl](./integer/shift/vsrl)

## integer/widening-add-sub

- [vwadd](./integer/widening-add-sub/vwadd)
- [vwaddu](./integer/widening-add-sub/vwaddu)
- [vwsub](./integer/widening-add-sub/vwsub)
- [vwsubu](./integer/widening-add-sub/vwsubu)

## integer/widening-multiply

- [vwmul](./integer/widening-multiply/vwmul)
- [vwmulsu](./integer/widening-multiply/vwmulsu)
- [vwmulu](./integer/widening-multiply/vwmulu)

## integer/widening-multiply-add

- [vwmacc](./integer/widening-multiply-add/vwmacc)
- [vwmaccsu](./integer/widening-multiply-add/vwmaccsu)
- [vwmaccu](./integer/widening-multiply-add/vwmaccu)
- [vwmaccus](./integer/widening-multiply-add/vwmaccus)

## mask/iota-index

- [vid](./mask/iota-index/vid)
- [viota](./mask/iota-index/viota)

## mask/logical

- [vmand](./mask/logical/vmand)
- [vmandn](./mask/logical/vmandn)
- [vmnand](./mask/logical/vmnand)
- [vmnor](./mask/logical/vmnor)
- [vmor](./mask/logical/vmor)
- [vmorn](./mask/logical/vmorn)
- [vmxnor](./mask/logical/vmxnor)
- [vmxor](./mask/logical/vmxor)

## mask/population-first

- [vcpop](./mask/population-first/vcpop)
- [vfirst](./mask/population-first/vfirst)

## mask/prefix

- [vmsbf](./mask/prefix/vmsbf)
- [vmsif](./mask/prefix/vmsif)
- [vmsof](./mask/prefix/vmsof)

## memory/fault-only-first

- [vle16ff](./memory/fault-only-first/vle16ff)
- [vle32ff](./memory/fault-only-first/vle32ff)
- [vle64ff](./memory/fault-only-first/vle64ff)
- [vle8ff](./memory/fault-only-first/vle8ff)

## memory/indexed

- [vloxei16](./memory/indexed/vloxei16)
- [vloxei32](./memory/indexed/vloxei32)
- [vloxei64](./memory/indexed/vloxei64)
- [vloxei8](./memory/indexed/vloxei8)
- [vluxei16](./memory/indexed/vluxei16)
- [vluxei32](./memory/indexed/vluxei32)
- [vluxei64](./memory/indexed/vluxei64)
- [vluxei8](./memory/indexed/vluxei8)
- [vsoxei16](./memory/indexed/vsoxei16)
- [vsoxei32](./memory/indexed/vsoxei32)
- [vsoxei64](./memory/indexed/vsoxei64)
- [vsoxei8](./memory/indexed/vsoxei8)
- [vsuxei16](./memory/indexed/vsuxei16)
- [vsuxei32](./memory/indexed/vsuxei32)
- [vsuxei64](./memory/indexed/vsuxei64)
- [vsuxei8](./memory/indexed/vsuxei8)

## memory/segment

- [vloxseg2ei16](./memory/segment/vloxseg2ei16)
- [vloxseg2ei32](./memory/segment/vloxseg2ei32)
- [vloxseg2ei64](./memory/segment/vloxseg2ei64)
- [vloxseg2ei8](./memory/segment/vloxseg2ei8)
- [vloxseg3ei16](./memory/segment/vloxseg3ei16)
- [vloxseg3ei32](./memory/segment/vloxseg3ei32)
- [vloxseg3ei64](./memory/segment/vloxseg3ei64)
- [vloxseg3ei8](./memory/segment/vloxseg3ei8)
- [vloxseg4ei16](./memory/segment/vloxseg4ei16)
- [vloxseg4ei32](./memory/segment/vloxseg4ei32)
- [vloxseg4ei64](./memory/segment/vloxseg4ei64)
- [vloxseg4ei8](./memory/segment/vloxseg4ei8)
- [vloxseg5ei16](./memory/segment/vloxseg5ei16)
- [vloxseg5ei32](./memory/segment/vloxseg5ei32)
- [vloxseg5ei64](./memory/segment/vloxseg5ei64)
- [vloxseg5ei8](./memory/segment/vloxseg5ei8)
- [vloxseg6ei16](./memory/segment/vloxseg6ei16)
- [vloxseg6ei32](./memory/segment/vloxseg6ei32)
- [vloxseg6ei64](./memory/segment/vloxseg6ei64)
- [vloxseg6ei8](./memory/segment/vloxseg6ei8)
- [vloxseg7ei16](./memory/segment/vloxseg7ei16)
- [vloxseg7ei32](./memory/segment/vloxseg7ei32)
- [vloxseg7ei64](./memory/segment/vloxseg7ei64)
- [vloxseg7ei8](./memory/segment/vloxseg7ei8)
- [vloxseg8ei16](./memory/segment/vloxseg8ei16)
- [vloxseg8ei32](./memory/segment/vloxseg8ei32)
- [vloxseg8ei64](./memory/segment/vloxseg8ei64)
- [vloxseg8ei8](./memory/segment/vloxseg8ei8)
- [vlseg2e16](./memory/segment/vlseg2e16)
- [vlseg2e32](./memory/segment/vlseg2e32)
- [vlseg2e64](./memory/segment/vlseg2e64)
- [vlseg2e8](./memory/segment/vlseg2e8)
- [vlseg3e16](./memory/segment/vlseg3e16)
- [vlseg3e32](./memory/segment/vlseg3e32)
- [vlseg3e64](./memory/segment/vlseg3e64)
- [vlseg3e8](./memory/segment/vlseg3e8)
- [vlseg4e16](./memory/segment/vlseg4e16)
- [vlseg4e32](./memory/segment/vlseg4e32)
- [vlseg4e64](./memory/segment/vlseg4e64)
- [vlseg4e8](./memory/segment/vlseg4e8)
- [vlseg5e16](./memory/segment/vlseg5e16)
- [vlseg5e32](./memory/segment/vlseg5e32)
- [vlseg5e64](./memory/segment/vlseg5e64)
- [vlseg5e8](./memory/segment/vlseg5e8)
- [vlseg6e16](./memory/segment/vlseg6e16)
- [vlseg6e32](./memory/segment/vlseg6e32)
- [vlseg6e64](./memory/segment/vlseg6e64)
- [vlseg6e8](./memory/segment/vlseg6e8)
- [vlseg7e16](./memory/segment/vlseg7e16)
- [vlseg7e32](./memory/segment/vlseg7e32)
- [vlseg7e64](./memory/segment/vlseg7e64)
- [vlseg7e8](./memory/segment/vlseg7e8)
- [vlseg8e16](./memory/segment/vlseg8e16)
- [vlseg8e32](./memory/segment/vlseg8e32)
- [vlseg8e64](./memory/segment/vlseg8e64)
- [vlseg8e8](./memory/segment/vlseg8e8)
- [vlsseg2e16](./memory/segment/vlsseg2e16)
- [vlsseg2e32](./memory/segment/vlsseg2e32)
- [vlsseg2e64](./memory/segment/vlsseg2e64)
- [vlsseg2e8](./memory/segment/vlsseg2e8)
- [vlsseg3e16](./memory/segment/vlsseg3e16)
- [vlsseg3e32](./memory/segment/vlsseg3e32)
- [vlsseg3e64](./memory/segment/vlsseg3e64)
- [vlsseg3e8](./memory/segment/vlsseg3e8)
- [vlsseg4e16](./memory/segment/vlsseg4e16)
- [vlsseg4e32](./memory/segment/vlsseg4e32)
- [vlsseg4e64](./memory/segment/vlsseg4e64)
- [vlsseg4e8](./memory/segment/vlsseg4e8)
- [vlsseg5e16](./memory/segment/vlsseg5e16)
- [vlsseg5e32](./memory/segment/vlsseg5e32)
- [vlsseg5e64](./memory/segment/vlsseg5e64)
- [vlsseg5e8](./memory/segment/vlsseg5e8)
- [vlsseg6e16](./memory/segment/vlsseg6e16)
- [vlsseg6e32](./memory/segment/vlsseg6e32)
- [vlsseg6e64](./memory/segment/vlsseg6e64)
- [vlsseg6e8](./memory/segment/vlsseg6e8)
- [vlsseg7e16](./memory/segment/vlsseg7e16)
- [vlsseg7e32](./memory/segment/vlsseg7e32)
- [vlsseg7e64](./memory/segment/vlsseg7e64)
- [vlsseg7e8](./memory/segment/vlsseg7e8)
- [vlsseg8e16](./memory/segment/vlsseg8e16)
- [vlsseg8e32](./memory/segment/vlsseg8e32)
- [vlsseg8e64](./memory/segment/vlsseg8e64)
- [vlsseg8e8](./memory/segment/vlsseg8e8)
- [vluxseg2ei16](./memory/segment/vluxseg2ei16)
- [vluxseg2ei32](./memory/segment/vluxseg2ei32)
- [vluxseg2ei64](./memory/segment/vluxseg2ei64)
- [vluxseg2ei8](./memory/segment/vluxseg2ei8)
- [vluxseg3ei16](./memory/segment/vluxseg3ei16)
- [vluxseg3ei32](./memory/segment/vluxseg3ei32)
- [vluxseg3ei64](./memory/segment/vluxseg3ei64)
- [vluxseg3ei8](./memory/segment/vluxseg3ei8)
- [vluxseg4ei16](./memory/segment/vluxseg4ei16)
- [vluxseg4ei32](./memory/segment/vluxseg4ei32)
- [vluxseg4ei64](./memory/segment/vluxseg4ei64)
- [vluxseg4ei8](./memory/segment/vluxseg4ei8)
- [vluxseg5ei16](./memory/segment/vluxseg5ei16)
- [vluxseg5ei32](./memory/segment/vluxseg5ei32)
- [vluxseg5ei64](./memory/segment/vluxseg5ei64)
- [vluxseg5ei8](./memory/segment/vluxseg5ei8)
- [vluxseg6ei16](./memory/segment/vluxseg6ei16)
- [vluxseg6ei32](./memory/segment/vluxseg6ei32)
- [vluxseg6ei64](./memory/segment/vluxseg6ei64)
- [vluxseg6ei8](./memory/segment/vluxseg6ei8)
- [vluxseg7ei16](./memory/segment/vluxseg7ei16)
- [vluxseg7ei32](./memory/segment/vluxseg7ei32)
- [vluxseg7ei64](./memory/segment/vluxseg7ei64)
- [vluxseg7ei8](./memory/segment/vluxseg7ei8)
- [vluxseg8ei16](./memory/segment/vluxseg8ei16)
- [vluxseg8ei32](./memory/segment/vluxseg8ei32)
- [vluxseg8ei64](./memory/segment/vluxseg8ei64)
- [vluxseg8ei8](./memory/segment/vluxseg8ei8)
- [vsoxseg2ei16](./memory/segment/vsoxseg2ei16)
- [vsoxseg2ei32](./memory/segment/vsoxseg2ei32)
- [vsoxseg2ei64](./memory/segment/vsoxseg2ei64)
- [vsoxseg2ei8](./memory/segment/vsoxseg2ei8)
- [vsoxseg3ei16](./memory/segment/vsoxseg3ei16)
- [vsoxseg3ei32](./memory/segment/vsoxseg3ei32)
- [vsoxseg3ei64](./memory/segment/vsoxseg3ei64)
- [vsoxseg3ei8](./memory/segment/vsoxseg3ei8)
- [vsoxseg4ei16](./memory/segment/vsoxseg4ei16)
- [vsoxseg4ei32](./memory/segment/vsoxseg4ei32)
- [vsoxseg4ei64](./memory/segment/vsoxseg4ei64)
- [vsoxseg4ei8](./memory/segment/vsoxseg4ei8)
- [vsoxseg5ei16](./memory/segment/vsoxseg5ei16)
- [vsoxseg5ei32](./memory/segment/vsoxseg5ei32)
- [vsoxseg5ei64](./memory/segment/vsoxseg5ei64)
- [vsoxseg5ei8](./memory/segment/vsoxseg5ei8)
- [vsoxseg6ei16](./memory/segment/vsoxseg6ei16)
- [vsoxseg6ei32](./memory/segment/vsoxseg6ei32)
- [vsoxseg6ei64](./memory/segment/vsoxseg6ei64)
- [vsoxseg6ei8](./memory/segment/vsoxseg6ei8)
- [vsoxseg7ei16](./memory/segment/vsoxseg7ei16)
- [vsoxseg7ei32](./memory/segment/vsoxseg7ei32)
- [vsoxseg7ei64](./memory/segment/vsoxseg7ei64)
- [vsoxseg7ei8](./memory/segment/vsoxseg7ei8)
- [vsoxseg8ei16](./memory/segment/vsoxseg8ei16)
- [vsoxseg8ei32](./memory/segment/vsoxseg8ei32)
- [vsoxseg8ei64](./memory/segment/vsoxseg8ei64)
- [vsoxseg8ei8](./memory/segment/vsoxseg8ei8)
- [vsseg2e16](./memory/segment/vsseg2e16)
- [vsseg2e32](./memory/segment/vsseg2e32)
- [vsseg2e64](./memory/segment/vsseg2e64)
- [vsseg2e8](./memory/segment/vsseg2e8)
- [vsseg3e16](./memory/segment/vsseg3e16)
- [vsseg3e32](./memory/segment/vsseg3e32)
- [vsseg3e64](./memory/segment/vsseg3e64)
- [vsseg3e8](./memory/segment/vsseg3e8)
- [vsseg4e16](./memory/segment/vsseg4e16)
- [vsseg4e32](./memory/segment/vsseg4e32)
- [vsseg4e64](./memory/segment/vsseg4e64)
- [vsseg4e8](./memory/segment/vsseg4e8)
- [vsseg5e16](./memory/segment/vsseg5e16)
- [vsseg5e32](./memory/segment/vsseg5e32)
- [vsseg5e64](./memory/segment/vsseg5e64)
- [vsseg5e8](./memory/segment/vsseg5e8)
- [vsseg6e16](./memory/segment/vsseg6e16)
- [vsseg6e32](./memory/segment/vsseg6e32)
- [vsseg6e64](./memory/segment/vsseg6e64)
- [vsseg6e8](./memory/segment/vsseg6e8)
- [vsseg7e16](./memory/segment/vsseg7e16)
- [vsseg7e32](./memory/segment/vsseg7e32)
- [vsseg7e64](./memory/segment/vsseg7e64)
- [vsseg7e8](./memory/segment/vsseg7e8)
- [vsseg8e16](./memory/segment/vsseg8e16)
- [vsseg8e32](./memory/segment/vsseg8e32)
- [vsseg8e64](./memory/segment/vsseg8e64)
- [vsseg8e8](./memory/segment/vsseg8e8)
- [vssseg2e16](./memory/segment/vssseg2e16)
- [vssseg2e32](./memory/segment/vssseg2e32)
- [vssseg2e64](./memory/segment/vssseg2e64)
- [vssseg2e8](./memory/segment/vssseg2e8)
- [vssseg3e16](./memory/segment/vssseg3e16)
- [vssseg3e32](./memory/segment/vssseg3e32)
- [vssseg3e64](./memory/segment/vssseg3e64)
- [vssseg3e8](./memory/segment/vssseg3e8)
- [vssseg4e16](./memory/segment/vssseg4e16)
- [vssseg4e32](./memory/segment/vssseg4e32)
- [vssseg4e64](./memory/segment/vssseg4e64)
- [vssseg4e8](./memory/segment/vssseg4e8)
- [vssseg5e16](./memory/segment/vssseg5e16)
- [vssseg5e32](./memory/segment/vssseg5e32)
- [vssseg5e64](./memory/segment/vssseg5e64)
- [vssseg5e8](./memory/segment/vssseg5e8)
- [vssseg6e16](./memory/segment/vssseg6e16)
- [vssseg6e32](./memory/segment/vssseg6e32)
- [vssseg6e64](./memory/segment/vssseg6e64)
- [vssseg6e8](./memory/segment/vssseg6e8)
- [vssseg7e16](./memory/segment/vssseg7e16)
- [vssseg7e32](./memory/segment/vssseg7e32)
- [vssseg7e64](./memory/segment/vssseg7e64)
- [vssseg7e8](./memory/segment/vssseg7e8)
- [vssseg8e16](./memory/segment/vssseg8e16)
- [vssseg8e32](./memory/segment/vssseg8e32)
- [vssseg8e64](./memory/segment/vssseg8e64)
- [vssseg8e8](./memory/segment/vssseg8e8)
- [vsuxseg2ei16](./memory/segment/vsuxseg2ei16)
- [vsuxseg2ei32](./memory/segment/vsuxseg2ei32)
- [vsuxseg2ei64](./memory/segment/vsuxseg2ei64)
- [vsuxseg2ei8](./memory/segment/vsuxseg2ei8)
- [vsuxseg3ei16](./memory/segment/vsuxseg3ei16)
- [vsuxseg3ei32](./memory/segment/vsuxseg3ei32)
- [vsuxseg3ei64](./memory/segment/vsuxseg3ei64)
- [vsuxseg3ei8](./memory/segment/vsuxseg3ei8)
- [vsuxseg4ei16](./memory/segment/vsuxseg4ei16)
- [vsuxseg4ei32](./memory/segment/vsuxseg4ei32)
- [vsuxseg4ei64](./memory/segment/vsuxseg4ei64)
- [vsuxseg4ei8](./memory/segment/vsuxseg4ei8)
- [vsuxseg5ei16](./memory/segment/vsuxseg5ei16)
- [vsuxseg5ei32](./memory/segment/vsuxseg5ei32)
- [vsuxseg5ei64](./memory/segment/vsuxseg5ei64)
- [vsuxseg5ei8](./memory/segment/vsuxseg5ei8)
- [vsuxseg6ei16](./memory/segment/vsuxseg6ei16)
- [vsuxseg6ei32](./memory/segment/vsuxseg6ei32)
- [vsuxseg6ei64](./memory/segment/vsuxseg6ei64)
- [vsuxseg6ei8](./memory/segment/vsuxseg6ei8)
- [vsuxseg7ei16](./memory/segment/vsuxseg7ei16)
- [vsuxseg7ei32](./memory/segment/vsuxseg7ei32)
- [vsuxseg7ei64](./memory/segment/vsuxseg7ei64)
- [vsuxseg7ei8](./memory/segment/vsuxseg7ei8)
- [vsuxseg8ei16](./memory/segment/vsuxseg8ei16)
- [vsuxseg8ei32](./memory/segment/vsuxseg8ei32)
- [vsuxseg8ei64](./memory/segment/vsuxseg8ei64)
- [vsuxseg8ei8](./memory/segment/vsuxseg8ei8)

## memory/strided

- [vlse16](./memory/strided/vlse16)
- [vlse32](./memory/strided/vlse32)
- [vlse64](./memory/strided/vlse64)
- [vlse8](./memory/strided/vlse8)
- [vsse16](./memory/strided/vsse16)
- [vsse32](./memory/strided/vsse32)
- [vsse64](./memory/strided/vsse64)
- [vsse8](./memory/strided/vsse8)

## memory/unit-stride

- [vle16](./memory/unit-stride/vle16)
- [vle32](./memory/unit-stride/vle32)
- [vle64](./memory/unit-stride/vle64)
- [vle8](./memory/unit-stride/vle8)
- [vlm](./memory/unit-stride/vlm)
- [vse16](./memory/unit-stride/vse16)
- [vse32](./memory/unit-stride/vse32)
- [vse64](./memory/unit-stride/vse64)
- [vse8](./memory/unit-stride/vse8)
- [vsm](./memory/unit-stride/vsm)

## memory/whole-register

- [vl1re16](./memory/whole-register/vl1re16)
- [vl1re32](./memory/whole-register/vl1re32)
- [vl1re64](./memory/whole-register/vl1re64)
- [vl1re8](./memory/whole-register/vl1re8)
- [vl2re16](./memory/whole-register/vl2re16)
- [vl2re32](./memory/whole-register/vl2re32)
- [vl2re64](./memory/whole-register/vl2re64)
- [vl2re8](./memory/whole-register/vl2re8)
- [vl4re16](./memory/whole-register/vl4re16)
- [vl4re32](./memory/whole-register/vl4re32)
- [vl4re64](./memory/whole-register/vl4re64)
- [vl4re8](./memory/whole-register/vl4re8)
- [vl8re16](./memory/whole-register/vl8re16)
- [vl8re32](./memory/whole-register/vl8re32)
- [vl8re64](./memory/whole-register/vl8re64)
- [vl8re8](./memory/whole-register/vl8re8)
- [vs1r](./memory/whole-register/vs1r)
- [vs2r](./memory/whole-register/vs2r)
- [vs4r](./memory/whole-register/vs4r)
- [vs8r](./memory/whole-register/vs8r)

## permutation/compress

- [vcompress](./permutation/compress/vcompress)

## permutation/gather

- [vrgather](./permutation/gather/vrgather)
- [vrgatherei16](./permutation/gather/vrgatherei16)

## permutation/scalar-move

- [vfmv.f.s](./permutation/scalar-move/vfmv-f-s)
- [vfmv.s.f](./permutation/scalar-move/vfmv-s-f)
- [vmv.s.x](./permutation/scalar-move/vmv-s-x)
- [vmv.x.s](./permutation/scalar-move/vmv-x-s)

## permutation/whole-register-move

- [vmv1r](./permutation/whole-register-move/vmv1r)
- [vmv2r](./permutation/whole-register-move/vmv2r)
- [vmv4r](./permutation/whole-register-move/vmv4r)
- [vmv8r](./permutation/whole-register-move/vmv8r)

## reduction/floating-point

- [vfredmax](./reduction/floating-point/vfredmax)
- [vfredmin](./reduction/floating-point/vfredmin)
- [vfredosum](./reduction/floating-point/vfredosum)
- [vfredusum](./reduction/floating-point/vfredusum)

## reduction/integer

- [vredand](./reduction/integer/vredand)
- [vredmax](./reduction/integer/vredmax)
- [vredmaxu](./reduction/integer/vredmaxu)
- [vredmin](./reduction/integer/vredmin)
- [vredminu](./reduction/integer/vredminu)
- [vredor](./reduction/integer/vredor)
- [vredsum](./reduction/integer/vredsum)
- [vredxor](./reduction/integer/vredxor)

## reduction/widening-floating-point

- [vfwredosum](./reduction/widening-floating-point/vfwredosum)
- [vfwredusum](./reduction/widening-floating-point/vfwredusum)

## reduction/widening-integer

- [vwredsum](./reduction/widening-integer/vwredsum)
- [vwredsumu](./reduction/widening-integer/vwredsumu)
