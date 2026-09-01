<script setup lang="ts">
import { computed, ref } from 'vue'

type LaneValue = number | string
type Architecture = 'riscv' | 'x86'
type OperationClass = 'arithmetic' | 'logical' | 'compare' | 'convert' | 'move' | 'memory' | 'permute' | 'reduction' | 'mask' | 'state' | 'crypto'
type SlideDirection = 'up' | 'down'
type TailPolicy = 'tu' | 'ta'
type MaskPolicy = 'mu' | 'ma'
type Vxrm = 'rnu' | 'rne' | 'rdn' | 'rod'
type MoveDirection = 'load' | 'store'

const props = withDefaults(defineProps<{
  kind: string
  instruction?: string
  architecture?: Architecture
  operationClass?: OperationClass
  vectorWidth?: number
  elementWidth?: number
  left?: LaneValue[]
  right?: LaneValue[]
  leftLabel?: string
  rightLabel?: string
  resultLabel?: string
  registerLabel?: string
  memoryLabel?: string
  source?: LaneValue[]
  secondSource?: LaneValue[]
  oldDestination?: LaneValue[]
  mask?: Array<number | boolean>
  sourceLabel?: string
  secondSourceLabel?: string
  destinationLabel?: string
  vl?: number
  vstart?: number
  initialOffset?: number
  initialDirection?: SlideDirection
  vlen?: number
  sew?: number
  lmul?: number
  sourceRegister?: number
  secondSourceRegister?: number
  destinationRegister?: number
  slideOne?: boolean
  insertValue?: LaneValue
  insertLabel?: string
  allowDirectionChange?: boolean
  tailPolicy?: TailPolicy
}>(), {
  architecture: 'riscv',
  operationClass: 'arithmetic',
  vectorWidth: 128,
  elementWidth: 32,
  left: () => [],
  right: () => [],
  leftLabel: 'xmm0（原值）',
  rightLabel: 'xmm1（源）',
  resultLabel: 'xmm0（结果）',
  registerLabel: 'xmm0',
  memoryLabel: 'm128',
  source: () => [],
  secondSource: () => [],
  oldDestination: () => [],
  mask: () => [0, 1, 0, 1, 1, 0, 0, 0],
  sourceLabel: 'vs2',
  secondSourceLabel: 'vs1',
  destinationLabel: 'vd',
  vl: 10,
  vstart: 0,
  initialOffset: 2,
  initialDirection: 'up',
  vlen: 128,
  sew: 32,
  lmul: 4,
  sourceRegister: 8,
  secondSourceRegister: 12,
  destinationRegister: 0,
  slideOne: false,
  insertValue: 99,
  insertLabel: 'x[rs1]',
  allowDirectionChange: true,
  tailPolicy: 'tu',
})

const maskBits = ref(props.mask.map(Boolean))
const offset = ref(props.slideOne ? 1 : props.initialOffset)
const direction = ref<SlideDirection>(props.initialDirection)
const animationNonce = ref(0)
const vlenValue = ref(props.vlen)
const sewValue = ref(props.sew)
const lmulValue = ref(props.lmul)
const vlValue = ref(props.vl)
const vstartValue = ref(props.vstart)
const sourceRegisterValue = ref(props.sourceRegister)
const secondSourceRegisterValue = ref(props.secondSourceRegister)
const destinationRegisterValue = ref(props.destinationRegister)
const tailPolicyValue = ref<TailPolicy>(props.tailPolicy)
const moveDirection = ref<MoveDirection>('load')
const genericVectorWidth = ref(props.vectorWidth)
const genericElementWidth = ref(props.elementWidth)
const vsetInstructionKinds = new Set(['vsetvli', 'vsetivli', 'vsetvl'])
const isRiscvVset = computed(() => vsetInstructionKinds.has(props.kind))
const configRd = ref(5)
const configRs1 = ref(10)
const configRs2 = ref(11)
const configAvl = ref(10)
const maskPolicyValue = ref<MaskPolicy>('mu')
const vxrmValue = ref<Vxrm>('rnu')
const isX86Add = computed(() => props.kind === 'addps' || props.kind === 'addpd')
const isX86Move = computed(() => props.kind === 'movaps' || props.kind === 'movapd' || props.kind === 'movupd')
const slideInstructionKinds = new Set(['vslideup', 'vslidedown', 'vslide1up', 'vslide1down', 'vfslide1up', 'vfslide1down'])
const isRiscvSlide = computed(() => slideInstructionKinds.has(props.kind))
const isAveragingAdd = computed(() => props.kind === 'vaadd' || props.kind === 'vaaddu')
const isSpecializedRiscv = computed(() => props.kind === 'vmerge' || isRiscvSlide.value)
const isGenericOperation = computed(() => !isX86Add.value && !isX86Move.value && !isSpecializedRiscv.value && !isRiscvVset.value)
const usesSecondVectorRegister = computed(() => props.kind === 'vmerge' || /\bv12\b/.test(props.instruction || ''))
const x86LaneWidth = computed(() => props.kind === 'addps' ? 32 : 64)
const x86LaneCount = computed(() => props.kind === 'addps' ? 4 : 2)
const x86DisplayIndices = computed(() => Array.from({ length: x86LaneCount.value }, (_, index) => x86LaneCount.value - index - 1))
const x86RegisterStyle = computed(() => ({
  gridTemplateColumns: `repeat(${x86LaneCount.value}, ${elementDiameter}px)`,
  width: `${x86LaneCount.value * elementDiameter + (x86LaneCount.value - 1) * elementGap}px`,
}))

function normalizeX86Value(value: LaneValue) {
  const parsed = Number(value)
  return x86LaneWidth.value === 32 ? Math.fround(parsed) : parsed
}

function formatX86Value(value: number) {
  if (Number.isNaN(value)) return 'NaN'
  if (value === Number.POSITIVE_INFINITY) return '+∞'
  if (value === Number.NEGATIVE_INFINITY) return '−∞'
  if (Object.is(value, -0)) return '−0'
  return Number.isFinite(value) ? String(Number(value.toPrecision(12))) : String(value)
}

function x86RegisterName(label: string) {
  return label.replace(/（.*$/, '')
}

const x86LeftValues = computed(() => Array.from(
  { length: x86LaneCount.value },
  (_, index) => normalizeX86Value(props.left[index] ?? index + 1),
))
const x86RightValues = computed(() => Array.from(
  { length: x86LaneCount.value },
  (_, index) => normalizeX86Value(props.right[index] ?? x86LaneCount.value + index + 1),
))
const x86Rows = computed(() => [
  { label: props.leftLabel, values: x86LeftValues.value },
  { label: props.rightLabel, values: x86RightValues.value },
  {
    label: props.resultLabel,
    values: x86LeftValues.value.map((value, index) => normalizeX86Value(value + x86RightValues.value[index])),
    result: true,
  },
])
const x86MoveLaneWidth = computed(() => props.kind === 'movaps' ? 32 : 64)
const x86MoveLaneCount = computed(() => props.kind === 'movaps' ? 4 : 2)
const x86MoveDisplayIndices = computed(() => Array.from({ length: x86MoveLaneCount.value }, (_, index) => x86MoveLaneCount.value - index - 1))
const x86MoveRegisterStyle = computed(() => ({
  gridTemplateColumns: `repeat(${x86MoveLaneCount.value}, ${elementDiameter}px)`,
  width: `${x86MoveLaneCount.value * elementDiameter + (x86MoveLaneCount.value - 1) * elementGap}px`,
}))
const x86MoveValues = computed(() => Array.from(
  { length: x86MoveLaneCount.value },
  (_, index) => {
    const value = Number(props.source[index] ?? index + 1)
    return x86MoveLaneWidth.value === 32 ? Math.fround(value) : value
  },
))
const x86MoveRows = computed(() => {
  const memory = `${props.memoryLabel}（内存）`
  return moveDirection.value === 'load'
    ? [{ label: memory }, { label: props.registerLabel, result: true }]
    : [{ label: props.registerLabel }, { label: memory, result: true }]
})

const normalizedGenericVectorWidth = computed(() => [64, 128, 256, 512].includes(Number(genericVectorWidth.value)) ? Number(genericVectorWidth.value) : 128)
const normalizedGenericElementWidth = computed(() => [8, 16, 32, 64].includes(Number(genericElementWidth.value)) ? Number(genericElementWidth.value) : 32)
const genericLaneCount = computed(() => props.architecture === 'riscv'
  ? laneCount.value
  : Math.max(1, Math.floor(normalizedGenericVectorWidth.value / normalizedGenericElementWidth.value)))
const genericDisplayIndices = computed(() => Array.from({ length: genericLaneCount.value }, (_, index) => genericLaneCount.value - index - 1))
const genericRegisterStyle = computed(() => ({
  gridTemplateColumns: `repeat(${genericLaneCount.value}, ${elementDiameter}px)`,
  width: `${genericLaneCount.value * elementDiameter + Math.max(0, genericLaneCount.value - 1) * elementGap}px`,
}))
function averagingSourceA(index: number): LaneValue {
  const magnitude = BigInt(index % 16 + 1)
  if (props.kind === 'vaadd') return -Number(magnitude)
  return displayInteger((1n << BigInt(normalizedSew.value)) - magnitude)
}

const genericSourceA = computed<LaneValue[]>(() => Array.from({ length: genericLaneCount.value }, (_, index) => (
  props.source[index] ?? (isAveragingAdd.value ? averagingSourceA(index) : index + 1)
)))
const genericSourceB = computed<LaneValue[]>(() => Array.from({ length: genericLaneCount.value }, (_, index) => {
  if (props.secondSource[index] !== undefined) return props.secondSource[index]
  if (isAveragingAdd.value) {
    const magnitude = BigInt(index % 16 + 1)
    // 与第一源相加后得到交替的 1、3；既展示符号解释差异，也保留 vxrm 的边界舍入差异。
    return displayInteger(magnitude + (index % 2 === 0 ? 1n : 3n))
  }
  return genericLaneCount.value + index + 1
}))

function laneInteger(value: LaneValue, signed: boolean) {
  let integer: bigint
  try {
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) return undefined
      integer = BigInt(Math.trunc(value))
    } else {
      if (!/^[+-]?\d+$/.test(value.trim())) return undefined
      integer = BigInt(value)
    }
  } catch {
    return undefined
  }
  return signed
    ? BigInt.asIntN(normalizedSew.value, integer)
    : BigInt.asUintN(normalizedSew.value, integer)
}

function displayInteger(value: bigint): LaneValue {
  const numeric = Number(value)
  return Number.isSafeInteger(numeric) ? numeric : value.toString()
}

function averagingAddResult(index: number): LaneValue {
  const signed = props.kind === 'vaadd'
  const left = laneInteger(genericSourceA.value[index], signed)
  const right = laneInteger(genericSourceB.value[index], signed)
  if (left === undefined || right === undefined) return `avg${index}`

  const sum = left + right
  const truncated = sum >> 1n
  const discarded = (sum & 1n) !== 0n
  const truncatedIsOdd = (truncated & 1n) !== 0n
  const increment = vxrmValue.value === 'rnu'
    ? discarded
    : vxrmValue.value === 'rne'
      ? discarded && truncatedIsOdd
      : vxrmValue.value === 'rod'
        ? discarded && !truncatedIsOdd
        : false

  return displayInteger(truncated + (increment ? 1n : 0n))
}

function genericResult(index: number): LaneValue {
  if (isAveragingAdd.value) return averagingAddResult(index)
  const left = Number(genericSourceA.value[index])
  const right = Number(genericSourceB.value[index])
  switch (props.operationClass) {
    case 'move':
    case 'memory': return genericSourceA.value[index]
    case 'compare': return index % 2 === 0 ? 0 : 'ALL-1'
    case 'logical': return Number.isFinite(left) && Number.isFinite(right) ? (left ^ right) : `bit[${index}]`
    case 'permute': return genericSourceA.value[genericLaneCount.value - index - 1]
    case 'reduction': return index === 0 ? genericSourceA.value.reduce((sum, value) => sum + Number(value), 0) : 'tail'
    case 'mask': return index % 2
    case 'state': return `cfg${index}`
    case 'crypto': return `mix${index}`
    case 'convert': return Number.isFinite(left) ? left : `cvt${index}`
    default: return Number.isFinite(left) && Number.isFinite(right) ? left + right : `result${index}`
  }
}

const genericX86Prefix = computed(() => normalizedGenericVectorWidth.value === 512 ? 'zmm' : normalizedGenericVectorWidth.value === 256 ? 'ymm' : normalizedGenericVectorWidth.value === 64 ? 'mm' : 'xmm')
const genericSourceRegisterName = computed(() => props.architecture === 'riscv' ? `v${sourceRegisterValue.value}` : `${genericX86Prefix.value}1`)
const genericSecondRegisterName = computed(() => props.architecture === 'riscv' ? `v${secondSourceRegisterValue.value}` : `${genericX86Prefix.value}2`)
const genericDestinationRegisterName = computed(() => props.architecture === 'riscv' ? `v${destinationRegisterValue.value}` : `${genericX86Prefix.value}0`)
const genericRange = computed(() => props.architecture === 'riscv'
  ? `[${Math.max(0, normalizedVlen.value * normalizedLmul.value - 1)}:0]`
  : `[${normalizedGenericVectorWidth.value - 1}:0]`)
const averagingInterpretation = computed(() => props.kind === 'vaadd' ? '有符号二补码' : '无符号整数')
const averagingBitPatternExample = computed(() => {
  const allOnes = (1n << BigInt(normalizedSew.value)) - 1n
  const bits = `0x${allOnes.toString(16).toUpperCase().padStart(normalizedSew.value / 4, '0')}`
  return `${bits} = ${props.kind === 'vaadd' ? '-1' : allOnes.toString()}`
})
const genericElementLabel = computed(() => {
  if (isAveragingAdd.value) return `${props.kind === 'vaadd' ? 'i' : 'u'}${normalizedSew.value}`
  return props.architecture === 'riscv' ? `SEW=${normalizedSew.value}` : `${normalizedGenericElementWidth.value} bits`
})

const vsewEncoding = computed(() => ({ 8: 0b000, 16: 0b001, 32: 0b010, 64: 0b011 }[normalizedSew.value] ?? 0b010))
const vlmulEncoding = computed(() => ({
  '0.125': 0b101,
  '0.25': 0b110,
  '0.5': 0b111,
  '1': 0b000,
  '2': 0b001,
  '4': 0b010,
  '8': 0b011,
}[String(normalizedLmul.value)] ?? 0b000))
const vtypeLowByte = computed(() =>
  (maskPolicyValue.value === 'ma' ? 0x80 : 0)
  | (tailPolicyValue.value === 'ta' ? 0x40 : 0)
  | (vsewEncoding.value << 3)
  | vlmulEncoding.value)
const vtypeBitRows = computed(() => [
  { bit: 7, name: 'vma', value: (vtypeLowByte.value >> 7) & 1, meaning: maskPolicyValue.value === 'ma' ? 'ma：被掩码元素可保持旧值或写全 1' : 'mu：被掩码元素保持旧值' },
  { bit: 6, name: 'vta', value: (vtypeLowByte.value >> 6) & 1, meaning: tailPolicyValue.value === 'ta' ? 'ta：尾部元素可保持旧值或写全 1' : 'tu：尾部元素保持旧值' },
  { bit: 5, name: 'vsew[2]', value: (vsewEncoding.value >> 2) & 1, meaning: `与位 4、3 组成 vsew=${binary(vsewEncoding.value, 3)}，选择 SEW=${normalizedSew.value}` },
  { bit: 4, name: 'vsew[1]', value: (vsewEncoding.value >> 1) & 1, meaning: `与位 5、3 共同编码元素宽度 SEW=${normalizedSew.value}` },
  { bit: 3, name: 'vsew[0]', value: vsewEncoding.value & 1, meaning: `与位 5、4 共同编码元素宽度 SEW=${normalizedSew.value}` },
  { bit: 2, name: 'vlmul[2]', value: (vlmulEncoding.value >> 2) & 1, meaning: `与位 1、0 组成 vlmul=${binary(vlmulEncoding.value, 3)}，选择 ${lmulLabel(normalizedLmul.value)}` },
  { bit: 1, name: 'vlmul[1]', value: (vlmulEncoding.value >> 1) & 1, meaning: `与位 2、0 共同编码 ${lmulLabel(normalizedLmul.value)}` },
  { bit: 0, name: 'vlmul[0]', value: vlmulEncoding.value & 1, meaning: `与位 2、1 共同编码 ${lmulLabel(normalizedLmul.value)}` },
])
const vsetEncodingFields = computed(() => {
  const common = [
    { range: '19:15', name: props.kind === 'vsetivli' ? 'uimm[4:0]' : 'rs1', value: props.kind === 'vsetivli' ? binary(configAvl.value, 5) : binary(configRs1.value, 5), meaning: props.kind === 'vsetivli' ? `零扩展 AVL=${configAvl.value}` : `整数寄存器 x${configRs1.value} 提供 AVL` },
    { range: '14:12', name: 'funct3', value: '111', meaning: '向量配置指令的固定功能码' },
    { range: '11:7', name: 'rd', value: binary(configRd.value, 5), meaning: `x${configRd.value} 接收新的 vl；rd=x0 时只更新 CSR` },
    { range: '6:0', name: 'opcode', value: '1010111', meaning: 'OP-V 主操作码' },
  ]
  if (props.kind === 'vsetvli') return [
    { range: '31', name: '固定', value: '0', meaning: '区分 vsetvli 与另外两种配置指令' },
    { range: '30:20', name: 'vtypei[10:0]', value: `${binary(0, 3)}${binary(vtypeLowByte.value, 8)}`, meaning: '位 10:8 必须为 0；位 7:0 按下表写入 vtype' },
    ...common,
  ]
  if (props.kind === 'vsetivli') return [
    { range: '31:30', name: '固定', value: '11', meaning: '选择立即数 AVL 形式' },
    { range: '29:20', name: 'vtypei[9:0]', value: `${binary(0, 2)}${binary(vtypeLowByte.value, 8)}`, meaning: '位 9:8 必须为 0；位 7:0 按下表写入 vtype' },
    ...common,
  ]
  return [
    { range: '31', name: '固定', value: '1', meaning: '选择寄存器 vtype 形式' },
    { range: '30:25', name: '固定', value: '000000', meaning: 'vsetvl 的保留编码位，必须全为 0' },
    { range: '24:20', name: 'rs2', value: binary(configRs2.value, 5), meaning: `x${configRs2.value} 提供完整 XLEN 位 vtype 值` },
    ...common,
  ]
})
const operationInstruction = computed(() => {
  if (props.architecture !== 'riscv') {
    if (isX86Move.value) {
      const register = props.registerLabel.replace(/（.*$/, '')
      return moveDirection.value === 'load'
        ? `${props.kind.toUpperCase()} ${register}, ${props.memoryLabel}`
        : `${props.kind.toUpperCase()} ${props.memoryLabel}, ${register}`
    }
    let instruction = props.instruction || `${props.kind.toUpperCase()} ${genericX86Prefix.value}0, ${genericX86Prefix.value}1`
    instruction = instruction.replace(/\b(?:mm|xmm|ymm|zmm)(\d+)\b/gi, (_match: string, index: string) => `${genericX86Prefix.value}${index}`)
    instruction = instruction.replace(/\bm(?:128|256|512)\b/gi, `m${normalizedGenericVectorWidth.value}`)
    return `${instruction}  ; ${normalizedGenericVectorWidth.value}-bit vector, ${normalizedGenericElementWidth.value}-bit element`
  }
  if (props.kind === 'vmerge') {
    return `vmerge.vvm v${destinationRegisterValue.value}, v${sourceRegisterValue.value}, v${secondSourceRegisterValue.value}, v0`
  }
  if (isRiscvSlide.value) {
    const destination = `v${destinationRegisterValue.value}`
    const source = `v${sourceRegisterValue.value}`
    if (!props.slideOne) return `${props.kind}.vi ${destination}, ${source}, ${normalizedOffset.value}, v0.t`
    const scalar = props.kind.startsWith('vf') ? 'fa0' : 'a1'
    return `${props.kind}.${props.kind.startsWith('vf') ? 'vf' : 'vx'} ${destination}, ${source}, ${scalar}, v0.t`
  }

  let instruction = props.instruction || props.kind
  instruction = instruction.replace(/^(\S+\s+)v0\b/, '$1__RVV_VD__')
  instruction = instruction.replace(/\bv8\b/g, '__RVV_VS2__')
  instruction = instruction.replace(/\bv12\b/g, '__RVV_VS1__')
  instruction = instruction
    .replace('__RVV_VD__', `v${destinationRegisterValue.value}`)
    .replace(/__RVV_VS2__/g, `v${sourceRegisterValue.value}`)
    .replace(/__RVV_VS1__/g, `v${secondSourceRegisterValue.value}`)
  return instruction
})
const riscvConfigurationInstructions = computed(() => {
  const avl = normalizedVl.value
  const lmul = lmulLabel(normalizedLmul.value).split(' · ')[0]
  const lines = [
    `li a0, ${avl}`,
    `vsetvli t0, a0, e${normalizedSew.value}, ${lmul}, ${tailPolicyValue.value}, ${maskPolicyValue.value}  # VLEN=${normalizedVlen.value}`,
  ]
  if (isAveragingAdd.value) {
    const encoding: Record<Vxrm, number> = { rnu: 0, rne: 1, rdn: 2, rod: 3 }
    lines.push(`csrwi vxrm, ${encoding[vxrmValue.value]}  # ${vxrmValue.value}`)
  }
  if (isSpecializedRiscv.value && normalizedVstart.value > 0) {
    if (normalizedVstart.value <= 31) lines.push(`csrwi vstart, ${normalizedVstart.value}`)
    else lines.push(`li t1, ${normalizedVstart.value}`, 'csrw vstart, t1')
  }
  lines.push(operationInstruction.value)
  return lines.join('\n')
})
const displayedInstruction = computed(() => {
  if (!isRiscvVset.value) {
    return props.architecture === 'riscv' ? riscvConfigurationInstructions.value : operationInstruction.value
  }
  const rd = `x${configRd.value}`
  const type = `e${normalizedSew.value}, ${lmulLabel(normalizedLmul.value).split(' · ')[0]}, ${tailPolicyValue.value}, ${maskPolicyValue.value}`
  const implementation = `# VLEN=${normalizedVlen.value}`
  if (props.kind === 'vsetivli') return `vsetivli ${rd}, ${configAvl.value}, ${type}  ${implementation}`
  if (props.kind === 'vsetvl') {
    const vtype = `0x${vtypeLowByte.value.toString(16).padStart(2, '0').toUpperCase()}`
    return `li x${configRs2.value}, ${vtype}\nvsetvl ${rd}, x${configRs1.value}, x${configRs2.value}  ${implementation}`
  }
  return `vsetvli ${rd}, x${configRs1.value}, ${type}  ${implementation}`
})

function binary(value: number, width: number) {
  return Math.max(0, Math.round(value)).toString(2).padStart(width, '0').slice(-width)
}

const normalizedVlen = computed(() => Math.max(128, Math.round(vlenValue.value)))
const normalizedSew = computed(() => [8, 16, 32, 64].includes(Math.round(sewValue.value)) ? Math.round(sewValue.value) : 32)
const normalizedLmul = computed(() => Math.max(0.125, Number(lmulValue.value)))
const vlmaxValue = computed(() => normalizedVlen.value * normalizedLmul.value / normalizedSew.value)
const configuredLaneCount = computed(() => Math.max(1, Math.floor(vlmaxValue.value)))
const laneCount = computed(() => configuredLaneCount.value)
const normalizedVl = computed(() => Math.min(laneCount.value, Math.max(0, Math.round(vlValue.value))))
const normalizedVstart = computed(() => Math.min(laneCount.value, Math.max(0, Math.round(vstartValue.value))))
const normalizedOffset = computed(() => props.slideOne ? 1 : Math.max(0, Math.round(offset.value)))
const displayIndices = computed(() => Array.from({ length: laneCount.value }, (_, index) => laneCount.value - index - 1))
const gridStyle = computed(() => ({ gridTemplateColumns: `repeat(${laneCount.value}, minmax(58px, 1fr))` }))
const elementDiameter = 78
const elementGap = 8
const elementPitch = elementDiameter + elementGap
const registerVisualWidth = computed(() => laneCount.value * elementDiameter + Math.max(0, laneCount.value - 1) * elementGap)
const bitRegisterStyle = computed(() => ({
  gridTemplateColumns: `repeat(${laneCount.value}, ${elementDiameter}px)`,
  width: `${registerVisualWidth.value}px`,
}))
const bitRegisterWidth = computed(() => ({ width: bitRegisterStyle.value.width }))
const connectorViewBox = computed(() => `0 0 ${registerVisualWidth.value} 74`)
const physicalRegisterCount = computed(() => Math.max(1, Math.ceil(normalizedLmul.value)))
const physicalGridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${physicalRegisterCount.value}, minmax(0, 1fr))`,
  width: bitRegisterStyle.value.width,
}))
const sourceValues = computed<LaneValue[]>(() => Array.from(
  { length: laneCount.value },
  (_, index) => props.source[index] ?? index + 1,
))
const oldDestinationValues = computed<LaneValue[]>(() => Array.from(
  { length: laneCount.value },
  (_, index) => props.oldDestination[index] ?? laneCount.value + index + 1,
))
const secondSourceValues = computed<LaneValue[]>(() => Array.from(
  { length: laneCount.value },
  (_, index) => props.secondSource[index] ?? laneCount.value * 2 + index + 1,
))

function valueAt(values: LaneValue[], index: number, fallback: LaneValue = 0) {
  return values[index] ?? fallback
}

function laneState(index: number) {
  if (index < normalizedVstart.value) return 'prestart'
  if (index >= normalizedVl.value) return 'tail'
  return 'body'
}

function isSlideOneDownInsertion(index: number) {
  return props.slideOne
    && direction.value === 'down'
    && normalizedVl.value > 0
    && index === normalizedVl.value - 1
}

function resultAt(index: number) {
  const oldValue = valueAt(oldDestinationValues.value, index)
  const state = laneState(index)
  if (normalizedVstart.value >= normalizedVl.value) return { value: oldValue, source: '无写入' }
  if (state === 'tail') {
    return tailPolicyValue.value === 'ta'
      ? { value: 'AGN', source: 'tail agnostic' }
      : { value: oldValue, source: 'tail 保持' }
  }
  if (state !== 'body') return { value: oldValue, source: state }

  if (props.kind === 'vmerge') {
    const useSecond = Boolean(maskBits.value[index])
    return {
      value: useSecond ? valueAt(secondSourceValues.value, index) : valueAt(sourceValues.value, index),
      source: useSecond ? props.secondSourceLabel : props.sourceLabel,
    }
  }

  if (isSlideOneDownInsertion(index)) {
    return { value: props.insertValue, source: props.insertLabel }
  }

  if (direction.value === 'up') {
    if (index < normalizedOffset.value) {
      if (props.slideOne && index === 0) return { value: props.insertValue, source: props.insertLabel }
      return { value: oldValue, source: '保持' }
    }
    return { value: valueAt(sourceValues.value, index - normalizedOffset.value), source: `${props.sourceLabel}[${index - normalizedOffset.value}]` }
  }

  const sourceIndex = index + normalizedOffset.value
  return sourceIndex < laneCount.value
    ? { value: valueAt(sourceValues.value, sourceIndex), source: `${props.sourceLabel}[${sourceIndex}]` }
    : { value: 0, source: '越界→0' }
}

function isResultChanged(index: number) {
  if (laneState(index) !== 'body' || normalizedVstart.value >= normalizedVl.value) return false
  if (props.kind === 'vmerge') return true
  if (direction.value === 'down') return true
  if (props.slideOne && index === 0) return true
  return index >= normalizedOffset.value
}

function connectionPath(mapping: { x1: number; x2: number }) {
  const endControlX = mapping.x2 + (mapping.x1 - mapping.x2) * 0.28
  return `M${mapping.x1} 3 C${mapping.x1} 26 ${endControlX} 48 ${mapping.x2} 68`
}

function toggleMask(index: number) {
  maskBits.value[index] = !maskBits.value[index]
}

function lmulLabel(value: number) {
  const names: Record<string, string> = {
    '0.125': 'mf8',
    '0.25': 'mf4',
    '0.5': 'mf2',
    '1': 'm1',
    '2': 'm2',
    '4': 'm4',
    '8': 'm8',
  }
  return `${names[String(value)]} · ${value}`
}

const slideMappings = computed(() => displayIndices.value.flatMap(destinationIndex => {
  if (laneState(destinationIndex) !== 'body') return []
  if (isSlideOneDownInsertion(destinationIndex)) return []
  const sourceIndex = direction.value === 'up'
    ? destinationIndex - normalizedOffset.value
    : destinationIndex + normalizedOffset.value
  if (sourceIndex < 0 || sourceIndex >= laneCount.value) return []
  return [{
    destinationIndex,
    sourceIndex,
    x1: (laneCount.value - sourceIndex - 1) * elementPitch + elementDiameter / 2,
    x2: (laneCount.value - destinationIndex - 1) * elementPitch + elementDiameter / 2,
  }]
}))

function replay() {
  animationNonce.value += 1
}

function refreshParameters() {
  replay()
}

function setDirection(value: SlideDirection) {
  direction.value = value
  replay()
}

function physicalRegisters(start: number) {
  const groupBits = normalizedVlen.value * normalizedLmul.value
  return Array.from({ length: physicalRegisterCount.value }, (_, displayIndex) => {
    const registerOffset = physicalRegisterCount.value - displayIndex - 1
    const low = normalizedLmul.value < 1 ? 0 : registerOffset * normalizedVlen.value
    const high = normalizedLmul.value < 1
      ? Math.max(0, groupBits - 1)
      : Math.min(groupBits - 1, (registerOffset + 1) * normalizedVlen.value - 1)
    return { name: `v${start + registerOffset}`, range: `[${high}:${low}]` }
  })
}

const sourcePhysicalRegisters = computed(() => physicalRegisters(sourceRegisterValue.value))
const secondSourcePhysicalRegisters = computed(() => physicalRegisters(secondSourceRegisterValue.value))
const destinationPhysicalRegisters = computed(() => physicalRegisters(destinationRegisterValue.value))
const rawVl = computed(() => Number(vlValue.value))
const rawVstart = computed(() => Number(vstartValue.value))
const rawOffset = computed(() => Number(offset.value))

function registerGroup(start: number) {
  const count = physicalRegisterCount.value
  return { start, end: start + count - 1 }
}

function groupsOverlap(left: { start: number, end: number }, right: { start: number, end: number }) {
  return left.start <= right.end && right.start <= left.end
}

const validationIssues = computed(() => {
  const issues: Array<{ level: 'error' | 'warning', text: string }> = []
  const sourceGroup = registerGroup(sourceRegisterValue.value)
  const secondSourceGroup = registerGroup(secondSourceRegisterValue.value)
  const destinationGroup = registerGroup(destinationRegisterValue.value)
  const integerLmul = normalizedLmul.value >= 1 ? normalizedLmul.value : 1

  if (!Number.isInteger(vlmaxValue.value) || vlmaxValue.value < 1) {
    issues.push({ level: 'error', text: `当前组合得到 VLMAX=${vlmaxValue.value}，VLMAX 必须是至少为 1 的整数；该 vtype 组合不能用于此演示。` })
  }

  if (!Number.isInteger(rawVl.value) || rawVl.value < 0) {
    issues.push({ level: 'error', text: 'vl 必须是非负整数。' })
  } else if (rawVl.value > laneCount.value) {
    issues.push({
      level: 'error',
      text: `vl=${rawVl.value} 超过当前 VLMAX=${laneCount.value}；实际 vl CSR 不可能保存这个值，位图暂按 ${normalizedVl.value} 演示。`,
    })
  }

  if (!Number.isInteger(rawVstart.value) || rawVstart.value < 0) {
    issues.push({ level: 'error', text: 'vstart 必须是非负整数。' })
  } else if (rawVstart.value >= normalizedVl.value && normalizedVl.value > 0) {
    issues.push({ level: 'warning', text: `vstart=${rawVstart.value} 不小于有效 vl=${normalizedVl.value}，本条向量指令不会写入任何元素。` })
  }

  if (!Number.isInteger(rawOffset.value) || rawOffset.value < 0) {
    issues.push({ level: 'error', text: 'initial-offset 必须是非负整数。' })
  }

  if (!Number.isInteger(sourceRegisterValue.value) || sourceRegisterValue.value < 0 || sourceRegisterValue.value > 31) {
    issues.push({ level: 'error', text: 'source-register 必须是 v0…v31 范围内的整数编号。' })
  }
  if (!Number.isInteger(destinationRegisterValue.value) || destinationRegisterValue.value < 0 || destinationRegisterValue.value > 31) {
    issues.push({ level: 'error', text: 'destination-register 必须是 v0…v31 范围内的整数编号。' })
  }
  if (usesSecondVectorRegister.value && (!Number.isInteger(secondSourceRegisterValue.value) || secondSourceRegisterValue.value < 0 || secondSourceRegisterValue.value > 31)) {
    issues.push({ level: 'error', text: 'second-source-register 必须是 v0…v31 范围内的整数编号。' })
  }

  if (normalizedLmul.value >= 2) {
    if (sourceRegisterValue.value % integerLmul !== 0) {
      issues.push({ level: 'error', text: `源寄存器组必须按 LMUL=${integerLmul} 对齐，v${sourceRegisterValue.value} 不是合法的起始寄存器。` })
    }
    if (destinationRegisterValue.value % integerLmul !== 0) {
      issues.push({ level: 'error', text: `目标寄存器组必须按 LMUL=${integerLmul} 对齐，v${destinationRegisterValue.value} 不是合法的起始寄存器。` })
    }
    if (usesSecondVectorRegister.value && secondSourceRegisterValue.value % integerLmul !== 0) {
      issues.push({ level: 'error', text: `第二源寄存器组必须按 LMUL=${integerLmul} 对齐，v${secondSourceRegisterValue.value} 不是合法的起始寄存器。` })
    }
  }

  if (sourceGroup.end > 31 || destinationGroup.end > 31 || (usesSecondVectorRegister.value && secondSourceGroup.end > 31)) {
    issues.push({ level: 'error', text: '寄存器组越过 v31，属于保留编码。' })
  }

  if (isRiscvSlide.value && direction.value === 'up' && groupsOverlap(sourceGroup, destinationGroup)) {
    issues.push({ level: 'error', text: 'vslideup/vslide1up 的 vd 不能与 vs2 寄存器组重叠。' })
  }
  if (props.kind === 'vmerge' && destinationGroup.start === 0) {
    issues.push({ level: 'error', text: 'vmerge 的目标寄存器组 vd 不能与选择掩码寄存器 v0 重叠。' })
  }

  if (normalizedSew.value > normalizedLmul.value * 64) {
    issues.push({ level: 'warning', text: '按 ELEN=64 的常见实现计算，此 SEW/LMUL 组合不保证受支持；vsetvli 可能设置 vill。' })
  }

  return issues
})
const parameterErrors = computed(() => validationIssues.value.filter(issue => issue.level === 'error'))
</script>

<template>
  <figure v-if="isRiscvVset" class="rv-register-operation rv-register-operation--vset">
    <figcaption>
      <span>{{ kind.toUpperCase() }} · VECTOR CONFIGURATION</span>
      <strong>32-BIT INSTRUCTION · XLEN-WIDE VTYPE</strong>
    </figcaption>
    <code class="rv-register-operation__instruction">{{ displayedInstruction }}</code>

    <div class="rv-register-operation__controls">
      <div class="rv-register-operation__parameters">
        <label><span><b>SEW</b><small>vtype[5:3] · 元素宽度</small></span><select v-model.number="sewValue"><option v-for="value in [8, 16, 32, 64]" :key="value" :value="value">e{{ value }}</option></select></label>
        <label><span><b>LMUL</b><small>vtype[2:0] · 寄存器组倍率</small></span><select v-model.number="lmulValue"><option v-for="value in [.125, .25, .5, 1, 2, 4, 8]" :key="value" :value="value">{{ lmulLabel(value) }}</option></select></label>
        <label><span><b>尾部策略</b><small>vtype[6] · vta</small></span><select v-model="tailPolicyValue"><option value="tu">tu · 0</option><option value="ta">ta · 1</option></select></label>
        <label><span><b>掩码策略</b><small>vtype[7] · vma</small></span><select v-model="maskPolicyValue"><option value="mu">mu · 0</option><option value="ma">ma · 1</option></select></label>
        <label><span><b>rd</b><small>接收新 vl 的整数寄存器编号</small></span><input v-model.number="configRd" type="number" min="0" max="31"></label>
        <label v-if="kind !== 'vsetivli'"><span><b>rs1</b><small>保存 AVL 的整数寄存器编号</small></span><input v-model.number="configRs1" type="number" min="0" max="31"></label>
        <label v-else><span><b>uimm</b><small>5 位零扩展 AVL（0…31）</small></span><input v-model.number="configAvl" type="number" min="0" max="31"></label>
        <label v-if="kind === 'vsetvl'"><span><b>rs2</b><small>保存完整 vtype 的整数寄存器编号</small></span><input v-model.number="configRs2" type="number" min="0" max="31"></label>
        <div class="rv-register-operation__derived"><span><b>vtype[7:0]</b><small>当前低 8 位结果</small></span><output>0b{{ binary(vtypeLowByte, 8) }} · 0x{{ vtypeLowByte.toString(16).padStart(2, '0').toUpperCase() }}</output></div>
        <div class="rv-register-operation__derived"><span><b>VLMAX</b><small>LMUL × VLEN ÷ SEW（示例 VLEN={{ normalizedVlen }}）</small></span><output>{{ vlmaxValue }} 个元素</output></div>
      </div>
    </div>

    <div class="rv-register-operation__vset-diagram">
      <section>
        <header><strong>32 位指令编码</strong><span>每个框说明相应位段的来源与作用</span></header>
        <div class="rv-register-operation__encoding-row">
          <article v-for="field in vsetEncodingFields" :key="`${field.range}-${field.name}`">
            <small>bit {{ field.range }}</small>
            <strong>{{ field.name }}</strong>
            <code>{{ field.value }}</code>
            <p>{{ field.meaning }}</p>
          </article>
        </div>
      </section>

      <section>
        <header><strong>写入 vtype 的每一位</strong><span>RV32 布局；RV64 仅将 vill 移到 bit 63</span></header>
        <div class="rv-register-operation__vtype-prefix">
          <article><small>bit XLEN−1</small><strong>vill</strong><code>0</code><p>硬件接受配置时为 0；不支持任一位组合时置 1，并把其余位及 vl 清零。</p></article>
          <article><small>bit XLEN−2:8</small><strong>reserved</strong><code>全 0</code><p>每一位都必须写 0；任一位非零都是不支持的 vtype。vsetvl 会检查 rs2 的全部 XLEN 位。</p></article>
        </div>
        <div class="rv-register-operation__vtype-bits">
          <article v-for="field in vtypeBitRows" :key="field.bit" :class="{ 'is-one': field.value === 1 }">
            <small>bit {{ field.bit }}</small>
            <strong>{{ field.name }}</strong>
            <code>{{ field.value }}</code>
            <p>{{ field.meaning }}</p>
          </article>
        </div>
      </section>
    </div>

    <footer>
      <span><i class="body" />修改选项后，编码位与含义同步更新</span>
      <span><i class="changed" /><code>vl</code> 由 AVL、VLMAX 与规范约束共同确定，并写入 rd</span>
      <small>配置指令不读写向量寄存器元素</small>
    </footer>
  </figure>

  <figure v-else-if="isX86Add" class="rv-register-operation rv-register-operation--x86">
    <figcaption>
      <span>{{ kind.toUpperCase() }} · PACKED REGISTER OPERATION · 128 BITS</span>
      <strong>{{ x86LaneCount }} × FLOAT{{ x86LaneWidth }}</strong>
    </figcaption>
    <code class="rv-register-operation__instruction">{{ displayedInstruction }}</code>

    <div class="rv-register-operation__bit-diagram rv-register-operation__x86-diagram">
      <section v-for="(row, rowIndex) in x86Rows" :key="row.label" :class="{ result: row.result }">
        <header><strong>{{ row.label }}</strong><span>128 BITS / XMM REGISTER</span></header>
        <div class="rv-register-operation__physical-ranges" :style="{ gridTemplateColumns: '1fr', width: x86RegisterStyle.width }">
          <span><b>{{ x86RegisterName(row.label) }}</b><code>[127:0]</code></span>
        </div>
        <div class="rv-register-operation__bit-register" :style="x86RegisterStyle">
          <div
            v-for="(index, displayIndex) in x86DisplayIndices"
            :key="index"
            class="rv-register-operation__bit-lane"
            :class="{ 'is-changed': row.result }"
            :style="row.result ? { animationDelay: `${displayIndex * 55 + 120}ms` } : undefined"
          >
            <small>{{ x86RegisterName(row.label) }}[{{ index }}]</small>
            <b>{{ formatX86Value(row.values[index]) }}</b>
            <em>FLOAT{{ x86LaneWidth }}</em>
          </div>
        </div>
      </section>
    </div>

    <footer>
      <span><i class="body" />每个圆球代表一个 FLOAT{{ x86LaneWidth }} 元素</span>
      <span><i class="changed" />强调背景：加法结果</span>
      <small>图中高索引在左、低索引在右</small>
    </footer>
  </figure>

  <figure v-else-if="isX86Move" class="rv-register-operation rv-register-operation--x86">
    <figcaption>
      <span>{{ kind.toUpperCase() }} · PACKED BIT COPY · 128 BITS</span>
      <strong>{{ x86MoveLaneCount }} × FLOAT{{ x86MoveLaneWidth }}</strong>
    </figcaption>
    <code class="rv-register-operation__instruction">{{ displayedInstruction }}</code>

    <div class="rv-register-operation__controls rv-register-operation__move-controls">
      <div aria-label="复制方向">
        <button type="button" :class="{ active: moveDirection === 'load' }" @click="moveDirection = 'load'">LOAD</button>
        <button type="button" :class="{ active: moveDirection === 'store' }" @click="moveDirection = 'store'">STORE</button>
      </div>
      <code>{{ kind === 'movupd' ? '允许非 16 字节对齐内存' : '内存操作数必须按 16 字节对齐' }}</code>
    </div>

    <div class="rv-register-operation__bit-diagram rv-register-operation__x86-diagram">
      <section v-for="(row, rowIndex) in x86MoveRows" :key="row.label" :class="{ result: row.result }">
        <header><strong>{{ row.label }}</strong><span>128 BITS</span></header>
        <div class="rv-register-operation__physical-ranges" :style="{ gridTemplateColumns: '1fr', width: x86MoveRegisterStyle.width }">
          <span><b>{{ x86RegisterName(row.label) }}</b><code>[127:0]</code></span>
        </div>
        <div class="rv-register-operation__bit-register" :style="x86MoveRegisterStyle">
          <div
            v-for="(index, displayIndex) in x86MoveDisplayIndices"
            :key="index"
            class="rv-register-operation__bit-lane"
            :class="{ 'is-changed': row.result }"
            :style="row.result ? { animationDelay: `${displayIndex * 55 + 120}ms` } : undefined"
          >
            <small>{{ x86RegisterName(row.label) }}[{{ index }}]</small>
            <b>{{ formatX86Value(x86MoveValues[index]) }}</b>
            <em>FLOAT{{ x86MoveLaneWidth }}</em>
          </div>
        </div>
      </section>
    </div>

    <footer>
      <span><i class="body" />每个圆球代表一个 FLOAT{{ x86MoveLaneWidth }} 元素</span>
      <span><i class="changed" />强调背景：复制目标</span>
      <small>图中高索引在左、低索引在右</small>
    </footer>
  </figure>

  <figure v-else-if="isGenericOperation" class="rv-register-operation" :class="{ 'rv-register-operation--x86': architecture === 'x86', 'has-parameter-error': architecture === 'riscv' && parameterErrors.length > 0 }">
    <figcaption>
      <span>{{ kind.toUpperCase() }} · REGISTER OPERATION</span>
      <strong>{{ architecture.toUpperCase() }} · {{ operationClass.toUpperCase() }}</strong>
    </figcaption>
    <code class="rv-register-operation__instruction">{{ displayedInstruction }}</code>

    <div class="rv-register-operation__controls">
      <div v-if="architecture === 'riscv'" class="rv-register-operation__parameters">
        <label><span><b>VLEN</b><small>单个物理向量寄存器位数</small></span><select v-model.number="vlenValue" @change="refreshParameters"><option :value="128">128</option><option :value="256">256</option><option :value="512">512</option></select></label>
        <label><span><b>SEW</b><small>每个向量元素的位数</small></span><select v-model.number="sewValue" @change="refreshParameters"><option :value="8">8</option><option :value="16">16</option><option :value="32">32</option><option :value="64">64</option></select></label>
        <label><span><b>LMUL</b><small>一个逻辑寄存器组占用的寄存器数</small></span><select v-model.number="lmulValue" @change="refreshParameters"><option :value="0.125">mf8</option><option :value="0.25">mf4</option><option :value="0.5">mf2</option><option :value="1">m1</option><option :value="2">m2</option><option :value="4">m4</option><option :value="8">m8</option></select></label>
        <label><span><b>vl</b><small>本次执行的活动元素数量</small></span><input v-model.number="vlValue" type="number" min="0" @input="refreshParameters"></label>
        <label><span><b>源寄存器</b><small>来源寄存器组起始编号</small></span><input v-model.number="sourceRegisterValue" type="number" min="0" max="31" @input="refreshParameters"></label>
        <label v-if="usesSecondVectorRegister"><span><b>第二源寄存器</b><small>第二来源或索引寄存器组起始编号</small></span><input v-model.number="secondSourceRegisterValue" type="number" min="0" max="31" @input="refreshParameters"></label>
        <label><span><b>目标寄存器</b><small>目标寄存器组起始编号</small></span><input v-model.number="destinationRegisterValue" type="number" min="0" max="31" @input="refreshParameters"></label>
        <label><span><b>尾部策略</b><small>vl 以后的目标元素处理方式</small></span><select v-model="tailPolicyValue" @change="refreshParameters"><option value="tu">tu · 保持</option><option value="ta">ta · agnostic</option></select></label>
        <label><span><b>掩码策略</b><small>被掩码目标元素的处理方式</small></span><select v-model="maskPolicyValue" @change="refreshParameters"><option value="mu">mu · 保持</option><option value="ma">ma · agnostic</option></select></label>
        <label v-if="isAveragingAdd"><span><b>vxrm</b><small>定点平均结果的舍入模式</small></span><select v-model="vxrmValue" @change="refreshParameters"><option value="rnu">rnu · 最近，平局向上</option><option value="rne">rne · 最近，平局取偶</option><option value="rdn">rdn · 截断</option><option value="rod">rod · 舍入到奇数</option></select></label>
        <div class="rv-register-operation__derived"><span><b>VLMAX</b><small>LMUL × VLEN ÷ SEW</small></span><output>{{ laneCount }}</output></div>
      </div>
      <div v-else class="rv-register-operation__parameters">
        <label><span><b>向量宽度</b><small>MMX/XMM/YMM/ZMM 有效位数</small></span><select v-model.number="genericVectorWidth"><option :value="64">64</option><option :value="128">128</option><option :value="256">256</option><option :value="512">512</option></select></label>
        <label><span><b>元素宽度</b><small>每个 packed 元素的位数</small></span><select v-model.number="genericElementWidth"><option :value="8">8</option><option :value="16">16</option><option :value="32">32</option><option :value="64">64</option></select></label>
        <div class="rv-register-operation__derived"><span><b>元素数量</b><small>向量宽度 ÷ 元素宽度</small></span><output>{{ genericLaneCount }}</output></div>
      </div>
      <div v-if="architecture === 'riscv' && validationIssues.length" class="rv-register-operation__validation" :class="{ error: parameterErrors.length }">
        <strong>{{ parameterErrors.length ? '参数不合法' : '配置提示' }}</strong>
        <ul><li v-for="issue in validationIssues" :key="issue.text" :class="issue.level">{{ issue.text }}</li></ul>
      </div>
    </div>

    <div :key="animationNonce" class="rv-register-operation__bit-diagram rv-register-operation__x86-diagram">
      <section>
        <header><strong>{{ sourceLabel }} · {{ genericSourceRegisterName }}</strong><span>{{ isAveragingAdd ? `第一来源 · ${averagingInterpretation}` : '第一来源' }}</span></header>
        <div class="rv-register-operation__physical-ranges" :style="{ gridTemplateColumns: '1fr', width: genericRegisterStyle.width }"><span><b>{{ genericSourceRegisterName }}</b><code>{{ genericRange }}</code></span></div>
        <div class="rv-register-operation__bit-register" :style="genericRegisterStyle">
          <div v-for="index in genericDisplayIndices" :key="index" class="rv-register-operation__bit-lane"><small>{{ sourceLabel }}[{{ index }}]</small><b>{{ genericSourceA[index] }}</b><em>{{ genericElementLabel }}</em></div>
        </div>
      </section>
      <section v-if="usesSecondVectorRegister || !['move', 'memory', 'state', 'reduction'].includes(operationClass)">
        <header><strong>{{ secondSourceLabel }} · {{ genericSecondRegisterName }}</strong><span>{{ isAveragingAdd ? `第二来源 · ${averagingInterpretation}` : '第二来源' }}</span></header>
        <div class="rv-register-operation__physical-ranges" :style="{ gridTemplateColumns: '1fr', width: genericRegisterStyle.width }"><span><b>{{ genericSecondRegisterName }}</b><code>{{ genericRange }}</code></span></div>
        <div class="rv-register-operation__bit-register" :style="genericRegisterStyle">
          <div v-for="index in genericDisplayIndices" :key="index" class="rv-register-operation__bit-lane"><small>{{ secondSourceLabel }}[{{ index }}]</small><b>{{ genericSourceB[index] }}</b><em>{{ genericElementLabel }}</em></div>
        </div>
      </section>
      <section class="result">
        <header><strong>{{ destinationLabel }} · {{ genericDestinationRegisterName }}（结果）</strong><span>{{ isAveragingAdd ? `${averagingInterpretation}平均` : operationClass }}</span></header>
        <div class="rv-register-operation__physical-ranges" :style="{ gridTemplateColumns: '1fr', width: genericRegisterStyle.width }"><span><b>{{ genericDestinationRegisterName }}</b><code>{{ genericRange }}</code></span></div>
        <div class="rv-register-operation__bit-register" :style="genericRegisterStyle">
          <div v-for="(index, displayIndex) in genericDisplayIndices" :key="index" class="rv-register-operation__bit-lane is-changed" :style="{ animationDelay: `${displayIndex * 35 + 80}ms` }"><small>{{ destinationLabel }}[{{ index }}]</small><b>{{ genericResult(index) }}</b><em>{{ isAveragingAdd ? `平均 · ${vxrmValue}` : operationClass }}</em></div>
        </div>
      </section>
    </div>

    <footer><span><i class="body" />每个圆球代表一个完整元素</span><span><i class="changed" />强调背景：目标写入</span><span v-if="isAveragingAdd"><code>{{ kind }}</code> 按{{ averagingInterpretation }}解释：{{ averagingBitPatternExample }}</span><small>高索引在左、低索引在右</small></footer>
  </figure>

  <figure v-else class="rv-register-operation" :class="{ 'has-parameter-error': parameterErrors.length > 0 }">
    <figcaption>
      <span>RVV REGISTER OPERATION</span>
      <strong>{{ kind === 'vmerge' ? 'MASK MERGE' : `${slideOne ? 'SLIDE1' : 'SLIDE'} ${direction.toUpperCase()}` }}</strong>
    </figcaption>
    <code class="rv-register-operation__instruction">{{ displayedInstruction }}</code>

    <div class="rv-register-operation__controls">
      <div class="rv-register-operation__parameters">
        <label>
          <span><b>VLEN</b><small>单个物理向量寄存器的位宽</small></span>
          <select v-model.number="vlenValue" @change="refreshParameters">
            <option :value="128">128 bits</option>
            <option :value="256">256 bits</option>
            <option :value="512">512 bits</option>
          </select>
        </label>
        <label>
          <span><b>SEW</b><small>每个向量元素的位宽</small></span>
          <select v-model.number="sewValue" @change="refreshParameters">
            <option v-for="value in [8, 16, 32, 64]" :key="value" :value="value">{{ value }} bits</option>
          </select>
        </label>
        <label>
          <span><b>LMUL</b><small>一个逻辑寄存器组占用的物理寄存器数</small></span>
          <select v-model.number="lmulValue" @change="refreshParameters">
            <option v-for="value in [.125, .25, .5, 1, 2, 4, 8]" :key="value" :value="value">{{ lmulLabel(value) }}</option>
          </select>
        </label>
        <label>
          <span><b>vl</b><small>实际 vl CSR，本次最多处理的元素数量</small></span>
          <input v-model.number="vlValue" type="number" min="0" :aria-invalid="rawVl > laneCount || rawVl < 0 || !Number.isInteger(rawVl)" @change="refreshParameters">
        </label>
        <label>
          <span><b>vstart</b><small>异常恢复时开始执行的元素索引</small></span>
          <input v-model.number="vstartValue" type="number" min="0" :aria-invalid="rawVstart < 0 || !Number.isInteger(rawVstart)" @change="refreshParameters">
        </label>
        <label>
          <span><b>尾部策略</b><small>vtype.vta：vl 之后的目标元素如何处理</small></span>
          <select v-model="tailPolicyValue" @change="refreshParameters">
            <option value="tu">tu · 保持原值</option>
            <option value="ta">ta · agnostic</option>
          </select>
        </label>
        <label>
          <span><b>掩码策略</b><small>vtype.vma：被掩码目标元素如何处理</small></span>
          <select v-model="maskPolicyValue" @change="refreshParameters">
            <option value="mu">mu · 保持原值</option>
            <option value="ma">ma · agnostic</option>
          </select>
        </label>
        <label>
          <span><b>source-register</b><small>源寄存器组 vs2 的起始物理寄存器</small></span>
          <input v-model.number="sourceRegisterValue" type="number" min="0" max="31" @change="refreshParameters">
        </label>
        <label v-if="kind === 'vmerge'">
          <span><b>second-source-register</b><small>第二源寄存器组 vs1 的起始物理寄存器</small></span>
          <input v-model.number="secondSourceRegisterValue" type="number" min="0" max="31" @change="refreshParameters">
        </label>
        <label>
          <span><b>destination-register</b><small>目标寄存器组 vd 的起始物理寄存器</small></span>
          <input v-model.number="destinationRegisterValue" type="number" min="0" max="31" @change="refreshParameters">
        </label>
        <label v-if="isRiscvSlide">
          <span><b>initial-offset</b><small>滑动的元素数量；.vx 按无符号 XLEN 解释</small></span>
          <input v-model.number="offset" type="number" min="0" :disabled="slideOne" @change="refreshParameters">
        </label>
        <div class="rv-register-operation__derived">
          <span><b>VLMAX</b><small>LMUL × VLEN ÷ SEW；派生值，不能直接设置</small></span>
          <output>{{ vlmaxValue }} 个元素</output>
        </div>
      </div>
      <div v-if="validationIssues.length" class="rv-register-operation__validation" :class="{ error: parameterErrors.length }" role="alert">
        <strong>{{ parameterErrors.length ? '参数不合法' : '执行提示' }}</strong>
        <ul>
          <li v-for="issue in validationIssues" :key="issue.text" :class="issue.level">{{ issue.text }}</li>
        </ul>
      </div>
      <div v-if="isRiscvSlide" class="rv-register-operation__slide-controls">
        <div v-if="allowDirectionChange" aria-label="滑动方向">
          <button type="button" :class="{ active: direction === 'up' }" @click="setDirection('up')">UP</button>
          <button type="button" :class="{ active: direction === 'down' }" @click="setDirection('down')">DOWN</button>
        </div>
        <code v-if="slideOne">插入值={{ insertValue }}（{{ insertLabel }}）</code>
        <button class="rv-register-operation__replay" type="button" @click="replay">REPLAY ↻</button>
      </div>

      <div v-else class="rv-register-operation__mask-control">
        <span>点击切换 v0.mask[i]</span>
        <div :style="gridStyle">
          <button
            v-for="index in displayIndices"
            :key="index"
            type="button"
            :class="{ active: maskBits[index], inactive: laneState(index) !== 'body' }"
            :aria-label="`v0[${index}]=${maskBits[index] ? 1 : 0}`"
            @click="toggleMask(index)"
          ><small>{{ index }}</small><b>{{ maskBits[index] ? 1 : 0 }}</b></button>
        </div>
      </div>
    </div>

    <div v-if="isRiscvSlide" :key="animationNonce" class="rv-register-operation__bit-diagram">
      <section class="initial-destination">
        <header><strong>{{ destinationLabel }} · {{ destinationPhysicalRegisters.map(item => item.name).reverse().join('–') }}（初值）</strong><span>写入前的目标寄存器组</span></header>
        <div class="rv-register-operation__physical-ranges" :style="physicalGridStyle">
          <span v-for="register in destinationPhysicalRegisters" :key="register.name"><b>{{ register.name }}</b><code>{{ register.range }}</code></span>
        </div>
        <div class="rv-register-operation__bit-register" :style="bitRegisterStyle">
          <div v-for="index in displayIndices" :key="index" class="rv-register-operation__bit-lane">
            <small>{{ destinationLabel }}[{{ index }}]</small>
            <b>{{ valueAt(oldDestinationValues, index) }}</b>
            <em>SEW={{ normalizedSew }}</em>
          </div>
        </div>
      </section>

      <section>
        <header><strong>{{ sourceLabel }} · {{ sourcePhysicalRegisters.map(item => item.name).reverse().join('–') }}</strong><span>{{ normalizedVlen * normalizedLmul }} BITS / REGISTER GROUP</span></header>
        <div class="rv-register-operation__physical-ranges" :style="physicalGridStyle">
          <span v-for="register in sourcePhysicalRegisters" :key="register.name"><b>{{ register.name }}</b><code>{{ register.range }}</code></span>
        </div>
        <div class="rv-register-operation__bit-register" :style="bitRegisterStyle">
          <div v-for="index in displayIndices" :key="index" class="rv-register-operation__bit-lane">
            <small>{{ sourceLabel }}[{{ index }}]</small>
            <b>{{ valueAt(sourceValues, index) }}</b>
            <em>SEW={{ normalizedSew }}</em>
          </div>
        </div>
      </section>

      <svg class="rv-register-operation__connections" :style="bitRegisterWidth" :viewBox="connectorViewBox" preserveAspectRatio="none" aria-label="源元素到目标元素的移动路径">
        <defs>
          <marker id="rv-slide-arrow" viewBox="0 0 12 12" refX="10.4" refY="6" markerWidth="8" markerHeight="8" orient="auto" markerUnits="userSpaceOnUse">
            <path class="rv-register-operation__arrow-head" d="M1.5 2L10.4 6L1.5 10" />
          </marker>
        </defs>
        <g v-for="mapping in slideMappings" :key="`${mapping.sourceIndex}-${mapping.destinationIndex}`">
          <title>{{ `${sourceLabel}[${mapping.sourceIndex}] → ${destinationLabel}[${mapping.destinationIndex}]` }}</title>
          <path
            class="rv-register-operation__connection-path"
            :d="connectionPath(mapping)"
            marker-end="url(#rv-slide-arrow)"
          />
        </g>
      </svg>

      <section class="result">
        <header><strong>{{ destinationLabel }} · {{ destinationPhysicalRegisters.map(item => item.name).reverse().join('–') }}（结果）</strong><span>{{ direction === 'up' ? '目标索引增大' : '目标索引减小' }}</span></header>
        <div class="rv-register-operation__physical-ranges" :style="physicalGridStyle">
          <span v-for="register in destinationPhysicalRegisters" :key="register.name"><b>{{ register.name }}</b><code>{{ register.range }}</code></span>
        </div>
        <div class="rv-register-operation__bit-register" :style="bitRegisterStyle">
          <div
            v-for="(index, displayIndex) in displayIndices"
            :key="index"
            class="rv-register-operation__bit-lane"
            :class="[`is-${laneState(index)}`, { 'is-changed': isResultChanged(index) }]"
            :style="{ animationDelay: `${displayIndex * 55 + 180}ms` }"
          >
            <small>{{ destinationLabel }}[{{ index }}]</small>
            <b>{{ resultAt(index).value }}</b>
            <em>{{ resultAt(index).source }}</em>
          </div>
        </div>
      </section>
    </div>

    <div v-else :key="animationNonce" class="rv-register-operation__bit-diagram rv-register-operation__merge-diagram">
      <section class="initial-destination">
        <header><strong>{{ destinationLabel }} · {{ destinationPhysicalRegisters.map(item => item.name).reverse().join('–') }}（初值）</strong><span>写入前的目标寄存器组</span></header>
        <div class="rv-register-operation__physical-ranges" :style="physicalGridStyle">
          <span v-for="register in destinationPhysicalRegisters" :key="register.name"><b>{{ register.name }}</b><code>{{ register.range }}</code></span>
        </div>
        <div class="rv-register-operation__bit-register" :style="bitRegisterStyle">
          <div v-for="index in displayIndices" :key="index" class="rv-register-operation__bit-lane">
            <small>{{ destinationLabel }}[{{ index }}]</small><b>{{ valueAt(oldDestinationValues, index) }}</b><em>SEW={{ normalizedSew }}</em>
          </div>
        </div>
      </section>

      <section>
        <header><strong>{{ sourceLabel }} · {{ sourcePhysicalRegisters.map(item => item.name).reverse().join('–') }}</strong><span>v0[i]=0 时选择</span></header>
        <div class="rv-register-operation__physical-ranges" :style="physicalGridStyle">
          <span v-for="register in sourcePhysicalRegisters" :key="register.name"><b>{{ register.name }}</b><code>{{ register.range }}</code></span>
        </div>
        <div class="rv-register-operation__bit-register" :style="bitRegisterStyle">
          <div v-for="index in displayIndices" :key="index" class="rv-register-operation__bit-lane" :class="{ 'is-selected-source': laneState(index) === 'body' && !maskBits[index] }">
            <small>{{ sourceLabel }}[{{ index }}]</small><b>{{ valueAt(sourceValues, index) }}</b><em>v0[{{ index }}]=0</em>
          </div>
        </div>
      </section>

      <section>
        <header><strong>{{ secondSourceLabel }} · {{ secondSourcePhysicalRegisters.map(item => item.name).reverse().join('–') }}</strong><span>v0[i]=1 时选择</span></header>
        <div class="rv-register-operation__physical-ranges" :style="physicalGridStyle">
          <span v-for="register in secondSourcePhysicalRegisters" :key="register.name"><b>{{ register.name }}</b><code>{{ register.range }}</code></span>
        </div>
        <div class="rv-register-operation__bit-register" :style="bitRegisterStyle">
          <div v-for="index in displayIndices" :key="index" class="rv-register-operation__bit-lane" :class="{ 'is-selected-source': laneState(index) === 'body' && Boolean(maskBits[index]) }">
            <small>{{ secondSourceLabel }}[{{ index }}]</small><b>{{ valueAt(secondSourceValues, index) }}</b><em>v0[{{ index }}]=1</em>
          </div>
        </div>
      </section>

      <section class="result">
        <header><strong>{{ destinationLabel }} · {{ destinationPhysicalRegisters.map(item => item.name).reverse().join('–') }}（结果）</strong><span>v0 逐元素选择来源</span></header>
        <div class="rv-register-operation__physical-ranges" :style="physicalGridStyle">
          <span v-for="register in destinationPhysicalRegisters" :key="register.name"><b>{{ register.name }}</b><code>{{ register.range }}</code></span>
        </div>
        <div class="rv-register-operation__bit-register" :style="bitRegisterStyle">
          <div v-for="(index, displayIndex) in displayIndices" :key="index" class="rv-register-operation__bit-lane" :class="[`is-${laneState(index)}`, { 'is-changed': isResultChanged(index) }]" :style="{ animationDelay: `${displayIndex * 55 + 120}ms` }">
            <small>{{ destinationLabel }}[{{ index }}]</small><b>{{ resultAt(index).value }}</b><em>{{ resultAt(index).source }}</em>
          </div>
        </div>
      </section>
    </div>

    <footer>
      <span><i class="body" />body：执行并写入</span>
      <span><i class="changed" />强调背景：本次操作写入</span>
      <span v-if="tailPolicyValue === 'tu'"><i class="tail" />tail：<code>tu</code> 下保持旧值</span>
      <span v-else><i class="tail agnostic" />tail：<code>ta</code> 下为 agnostic</span>
      <small>图中高索引在左、低索引在右</small>
    </footer>
  </figure>
</template>

<style scoped>
.rv-register-operation { --rv-accent: #2c356d; margin: 28px 0; font-family: var(--vp-font-family-mono); }
.rv-register-operation > figcaption { display: flex; justify-content: space-between; gap: 12px; padding: 0 4px 9px; color: var(--rv-accent); font-size: 9px; letter-spacing: .12em; }
.rv-register-operation > figcaption strong { color: var(--vp-c-text-3); font-size: 9px; }
.rv-register-operation__instruction { display: block; box-sizing: border-box; width: 100%; margin: 0; padding: 10px 14px; border: 1px solid color-mix(in srgb, var(--rv-accent) 35%, var(--vp-c-divider)); border-bottom: 0; border-radius: 10px 10px 0 0; color: var(--rv-accent); background: color-mix(in srgb, var(--rv-accent) 7%, var(--vp-c-bg)); font: 750 12px/1.55 var(--vp-font-family-mono); overflow-wrap: anywhere; white-space: pre-wrap; }
.rv-register-operation__controls { padding: 12px 14px; border: 1px solid var(--vp-c-divider); border-bottom: 0; border-radius: 14px 14px 0 0; background: var(--vp-c-bg-soft); }
.rv-register-operation__instruction + .rv-register-operation__controls { border-radius: 0; }
.rv-register-operation__parameters { display: grid; grid-template-columns: repeat(auto-fit, minmax(145px, 1fr)); gap: 8px; margin-bottom: 10px; }
.rv-register-operation__parameters label { display: grid; grid-template-rows: 1fr auto; gap: 7px; min-width: 0; padding: 9px; border: 1px solid var(--vp-c-divider); border-radius: 7px; background: color-mix(in srgb, var(--vp-c-bg) 72%, transparent); }
.rv-register-operation__derived { display: grid; grid-template-rows: 1fr auto; gap: 7px; min-width: 0; padding: 9px; border: 1px dashed color-mix(in srgb, var(--rv-accent) 55%, var(--vp-c-divider)); border-radius: 7px; background: color-mix(in srgb, var(--rv-accent) 5%, var(--vp-c-bg)); }
.rv-register-operation__parameters span { display: grid; gap: 2px; }
.rv-register-operation__parameters b { color: var(--rv-accent); font-size: 10px; }
.rv-register-operation__parameters small { color: var(--vp-c-text-3); font: 9px/1.35 var(--vp-font-family-base); }
.rv-register-operation__derived output { padding: 6px 7px; color: var(--rv-accent); font: 750 10px var(--vp-font-family-mono); }
.rv-register-operation__parameters select,
.rv-register-operation__parameters input { box-sizing: border-box; width: 100%; min-width: 0; padding: 6px 7px; border: 1px solid var(--vp-c-divider); border-radius: 4px; outline: none; color: var(--vp-c-text-1); background: var(--vp-c-bg); font: 10px var(--vp-font-family-mono); }
.rv-register-operation__parameters select:focus,
.rv-register-operation__parameters input:focus { border-color: var(--rv-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--rv-accent) 12%, transparent); }
.rv-register-operation__parameters input[aria-invalid="true"] { border-color: #c43f3f; color: #b83232; box-shadow: 0 0 0 2px color-mix(in srgb, #c43f3f 12%, transparent); }
.rv-register-operation__validation { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; align-items: start; margin-bottom: 10px; padding: 9px 11px; border: 1px solid #c58a28; border-radius: 7px; color: #986619; background: color-mix(in srgb, #e6ac2c 9%, var(--vp-c-bg)); font: 10px/1.45 var(--vp-font-family-base); }
.rv-register-operation__validation.error { border-color: #c43f3f; color: #a62f2f; background: color-mix(in srgb, #c43f3f 8%, var(--vp-c-bg)); }
.rv-register-operation__validation strong { font: 800 10px/1.45 var(--vp-font-family-mono); white-space: nowrap; }
.rv-register-operation__validation ul { margin: 0; padding-left: 17px; }
.rv-register-operation__validation li + li { margin-top: 3px; }
.rv-register-operation__validation li.warning { color: #986619; }
.rv-register-operation__slide-controls { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-top: 12px; }
.rv-register-operation__slide-controls > div { display: flex; overflow: hidden; border: 1px solid var(--vp-c-divider); border-radius: 6px; }
.rv-register-operation button { cursor: pointer; }
.rv-register-operation__slide-controls button { padding: 7px 12px; border: 0; color: var(--vp-c-text-3); background: transparent; font: 700 9px/1 var(--vp-font-family-mono); }
.rv-register-operation__slide-controls button.active { color: white; background: var(--rv-accent); }
.rv-register-operation__slide-controls > code { padding: 6px 9px; color: var(--rv-accent); background: var(--vp-c-bg); font-size: 10px; }
.rv-register-operation__move-controls { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.rv-register-operation__move-controls > div { display: flex; overflow: hidden; border: 1px solid var(--vp-c-divider); border-radius: 6px; }
.rv-register-operation__move-controls button { padding: 7px 12px; border: 0; color: var(--vp-c-text-3); background: transparent; font: 700 9px/1 var(--vp-font-family-mono); }
.rv-register-operation__move-controls button.active { color: white; background: var(--rv-accent); }
.rv-register-operation__move-controls > code { margin-left: auto; color: var(--rv-accent); background: transparent; font-size: 10px; }
.rv-register-operation__replay { margin-left: auto; padding: 7px 10px; border: 1px solid var(--rv-accent); border-radius: 5px; color: var(--rv-accent); background: transparent; font: 700 9px/1 var(--vp-font-family-mono); }
.rv-register-operation__mask-control { margin-top: 12px; }
.rv-register-operation__mask-control > span { display: block; margin-bottom: 7px; color: var(--vp-c-text-2); font: 10px var(--vp-font-family-base); }
.rv-register-operation__mask-control > div { display: grid; gap: 7px; min-width: 510px; }
.rv-register-operation__mask-control { overflow-x: auto; }
.rv-register-operation__mask-control button { display: grid; grid-template-columns: 1fr auto; align-items: center; min-width: 0; padding: 6px 8px; border: 1px solid var(--vp-c-divider); border-radius: 5px; color: var(--vp-c-text-2); background: var(--vp-c-bg); }
.rv-register-operation__mask-control button.active { border-color: var(--rv-accent); color: white; background: var(--rv-accent); }
.rv-register-operation__mask-control button.inactive { opacity: .5; }
.rv-register-operation__mask-control small { font-size: 8px; }
.rv-register-operation__mask-control b { font-size: 12px; }
.rv-register-operation__bit-diagram { overflow-x: auto; padding: 18px; border: 1px solid color-mix(in srgb, var(--rv-accent) 22%, var(--vp-c-divider)); background: linear-gradient(90deg, color-mix(in srgb, var(--rv-accent) 5%, transparent) 1px, transparent 1px), linear-gradient(color-mix(in srgb, var(--rv-accent) 5%, transparent) 1px, transparent 1px), color-mix(in srgb, var(--vp-c-bg-elv) 90%, transparent); background-size: 24px 24px; box-shadow: var(--panel-shadow); }
.rv-register-operation__vset-diagram { overflow-x: auto; padding: 18px; border: 1px solid color-mix(in srgb, var(--rv-accent) 22%, var(--vp-c-divider)); background: linear-gradient(90deg, color-mix(in srgb, var(--rv-accent) 5%, transparent) 1px, transparent 1px), linear-gradient(color-mix(in srgb, var(--rv-accent) 5%, transparent) 1px, transparent 1px), color-mix(in srgb, var(--vp-c-bg-elv) 90%, transparent); background-size: 24px 24px; box-shadow: var(--panel-shadow); }
.rv-register-operation__vset-diagram > section { min-width: 760px; }
.rv-register-operation__vset-diagram > section + section { margin-top: 22px; padding-top: 20px; border-top: 1px dashed color-mix(in srgb, var(--rv-accent) 32%, var(--vp-c-divider)); }
.rv-register-operation__vset-diagram header { display: flex; justify-content: space-between; gap: 14px; align-items: baseline; margin-bottom: 9px; color: var(--vp-c-text-2); font: 650 11px/1.4 var(--vp-font-family-base); }
.rv-register-operation__vset-diagram header span { color: var(--vp-c-text-3); font: 8px var(--vp-font-family-mono); }
.rv-register-operation__encoding-row { display: flex; align-items: stretch; min-width: max-content; }
.rv-register-operation__encoding-row article { display: grid; grid-template-rows: auto auto auto 1fr; gap: 4px; width: 124px; min-width: 0; padding: 10px; border: 1px solid var(--rv-accent); border-right: 0; background: color-mix(in srgb, var(--rv-accent) 6%, var(--vp-c-bg)); }
.rv-register-operation__encoding-row article:last-child { border-right: 1px solid var(--rv-accent); }
.rv-register-operation__vtype-prefix { display: grid; grid-template-columns: minmax(160px, .8fr) minmax(380px, 2.2fr); gap: 8px; margin-bottom: 8px; }
.rv-register-operation__vtype-bits { display: grid; grid-template-columns: repeat(8, minmax(94px, 1fr)); gap: 0; }
.rv-register-operation__vtype-prefix article,
.rv-register-operation__vtype-bits article { display: grid; grid-template-rows: auto auto auto 1fr; gap: 4px; min-width: 0; padding: 10px; border: 1px solid color-mix(in srgb, var(--rv-accent) 55%, var(--vp-c-divider)); background: color-mix(in srgb, var(--rv-accent) 5%, var(--vp-c-bg)); }
.rv-register-operation__vtype-bits article { border-right: 0; }
.rv-register-operation__vtype-bits article:last-child { border-right: 1px solid color-mix(in srgb, var(--rv-accent) 55%, var(--vp-c-divider)); }
.rv-register-operation__vtype-bits article.is-one { background: color-mix(in srgb, #2b9270 16%, var(--vp-c-bg)); }
.rv-register-operation__vset-diagram article small { color: var(--vp-c-text-3); font-size: 8px; }
.rv-register-operation__vset-diagram article strong { color: var(--rv-accent); font-size: 10px; }
.rv-register-operation__vset-diagram article code { width: max-content; padding: 2px 5px; color: #237a5e; background: color-mix(in srgb, #2b9270 10%, var(--vp-c-bg)); font-size: 10px; font-weight: 800; }
.rv-register-operation__vset-diagram article p { margin: 2px 0 0; color: var(--vp-c-text-2); font: 9px/1.5 var(--vp-font-family-base); }
.rv-register-operation__bit-diagram > section { min-width: max-content; }
.rv-register-operation__bit-diagram > section > header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 7px; color: var(--vp-c-text-2); font: 650 11px/1.4 var(--vp-font-family-base); }
.rv-register-operation__bit-diagram > section > header span { color: var(--vp-c-text-3); font: 8px var(--vp-font-family-mono); }
.rv-register-operation__bit-diagram > section.initial-destination { margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px dashed color-mix(in srgb, var(--rv-accent) 32%, var(--vp-c-divider)); }
.rv-register-operation__physical-ranges { display: grid; min-width: max-content; margin-bottom: 5px; }
.rv-register-operation__physical-ranges span { display: flex; justify-content: space-between; padding: 5px 8px; border: 1px solid var(--rv-accent); border-right: 0; color: var(--rv-accent); background: color-mix(in srgb, var(--rv-accent) 7%, var(--vp-c-bg)); }
.rv-register-operation__physical-ranges span:last-child { border-right: 1px solid var(--rv-accent); }
.rv-register-operation__physical-ranges b { font-size: 10px; }
.rv-register-operation__physical-ranges code { color: inherit; background: none; font-size: 9px; }
.rv-register-operation__bit-register { display: grid; gap: 8px; min-width: max-content; padding: 8px 0; }
.rv-register-operation__bit-lane { display: grid; place-content: center; justify-items: center; box-sizing: border-box; width: 78px; height: 78px; min-width: 0; padding: 8px; border: 1px solid color-mix(in srgb, var(--rv-accent) 58%, var(--vp-c-divider)); border-radius: 50%; background: radial-gradient(circle at 35% 28%, color-mix(in srgb, var(--vp-c-bg) 95%, white), color-mix(in srgb, var(--rv-accent) 8%, var(--vp-c-bg-soft)) 68%, color-mix(in srgb, var(--rv-accent) 18%, var(--vp-c-bg-soft))); box-shadow: inset 0 0 0 3px color-mix(in srgb, var(--rv-accent) 5%, transparent), 0 7px 15px color-mix(in srgb, var(--rv-accent) 12%, transparent); }
.rv-register-operation__bit-lane > small { overflow: hidden; max-width: 62px; color: var(--vp-c-text-3); font-size: 7px; text-overflow: ellipsis; white-space: nowrap; }
.rv-register-operation__bit-lane > b { overflow: hidden; max-width: 62px; margin: 3px 0; color: var(--vp-c-text-1); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.rv-register-operation__bit-lane > em { overflow: hidden; max-width: 62px; color: var(--rv-accent); font: 7px var(--vp-font-family-mono); text-overflow: ellipsis; white-space: nowrap; }
.rv-register-operation__merge-diagram > section + section { margin-top: 18px; padding-top: 18px; border-top: 1px dashed color-mix(in srgb, var(--rv-accent) 32%, var(--vp-c-divider)); }
.rv-register-operation__x86-diagram > section + section { margin-top: 16px; padding-top: 16px; border-top: 1px dashed color-mix(in srgb, var(--rv-accent) 32%, var(--vp-c-divider)); }
.rv-register-operation__merge-diagram .rv-register-operation__bit-lane.is-selected-source { border-color: var(--rv-accent); background: radial-gradient(circle at 35% 28%, color-mix(in srgb, var(--rv-accent) 18%, var(--vp-c-bg)), color-mix(in srgb, var(--rv-accent) 24%, var(--vp-c-bg-soft)) 68%, color-mix(in srgb, var(--rv-accent) 38%, var(--vp-c-bg-soft))); box-shadow: inset 0 0 0 3px color-mix(in srgb, var(--rv-accent) 14%, transparent), 0 7px 17px color-mix(in srgb, var(--rv-accent) 24%, transparent); }
.rv-register-operation__merge-diagram .rv-register-operation__bit-lane.is-selected-source > em { font-weight: 800; }
.rv-register-operation__connections { display: block; min-width: max-content; width: 100%; height: 74px; overflow: visible; }
.rv-register-operation__connection-path { fill: none; stroke: color-mix(in srgb, var(--rv-accent) 82%, var(--vp-c-text-2)); stroke-width: 1.25; stroke-dasharray: 6 5; stroke-linecap: round; vector-effect: non-scaling-stroke; animation: rvSlideFlow 1.1s linear infinite; }
.rv-register-operation__arrow-head { fill: none; stroke: var(--rv-accent); stroke-width: 1.05; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.rv-register-operation__bit-diagram > section.result .rv-register-operation__bit-lane { opacity: 0; background: color-mix(in srgb, var(--rv-accent) 8%, var(--vp-c-bg-soft)); animation: rvSlideLaneIn .5s cubic-bezier(.2,.75,.2,1) forwards; }
.rv-register-operation__bit-diagram > section.result .rv-register-operation__bit-lane.is-changed { border-color: #2b9270; background: radial-gradient(circle at 35% 28%, color-mix(in srgb, #55c69b 24%, var(--vp-c-bg)), color-mix(in srgb, #2b9270 25%, var(--vp-c-bg-soft)) 68%, color-mix(in srgb, #2b9270 38%, var(--vp-c-bg-soft))); box-shadow: inset 0 0 0 3px color-mix(in srgb, #2b9270 10%, transparent), 0 8px 18px color-mix(in srgb, #2b9270 25%, transparent); }
.rv-register-operation__bit-diagram > section.result .rv-register-operation__bit-lane.is-changed > em { color: #237a5e; font-weight: 800; }
.rv-register-operation__bit-diagram > section.result .rv-register-operation__bit-lane.is-tail { opacity: 0; }
.rv-register-operation > footer { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; padding: 10px 14px; border: 1px solid var(--vp-c-divider); border-top: 0; border-radius: 0 0 14px 14px; color: var(--vp-c-text-2); background: var(--vp-c-bg-soft); font: 10px/1.4 var(--vp-font-family-base); }
.rv-register-operation > footer span { display: flex; gap: 6px; align-items: center; }
.rv-register-operation > footer code { color: var(--rv-accent); font-size: 9px; }
.rv-register-operation > footer i { width: 9px; height: 9px; border: 1px solid var(--rv-accent); border-radius: 50%; }
.rv-register-operation > footer i.body { background: var(--rv-accent); }
.rv-register-operation > footer i.changed { border-color: #2b9270; background: #55c69b; box-shadow: 0 0 5px color-mix(in srgb, #2b9270 38%, transparent); }
.rv-register-operation > footer i.tail { opacity: .45; }
.rv-register-operation > footer i.tail.agnostic { opacity: 1; background: repeating-linear-gradient(135deg, var(--rv-accent) 0 2px, transparent 2px 4px); }
.rv-register-operation > footer small { margin-left: auto; color: var(--vp-c-text-3); font-size: 9px; }
:global(.dark) .rv-register-operation { --rv-accent: #e6ac2c; }
@keyframes rvSlideFlow { from { stroke-dashoffset: 22; } to { stroke-dashoffset: 0; } }
@keyframes rvSlideLaneIn { from { opacity: 0; transform: translateY(-13px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .rv-register-operation__connection-path, .rv-register-operation__bit-diagram > section.result .rv-register-operation__bit-lane { opacity: 1; animation: none; } }
@media (max-width: 900px) { .rv-register-operation__parameters { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .rv-register-operation__parameters { grid-template-columns: 1fr; } .rv-register-operation__replay { margin-left: 0; } .rv-register-operation__bit-diagram { padding: 12px; } }
</style>
