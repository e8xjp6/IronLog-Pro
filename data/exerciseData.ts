
export const EQUIPMENT_OPTIONS = [
  { id: 'barbell', label: '槓鈴', prefix: '槓鈴' },
  { id: 'dumbbell', label: '啞鈴', prefix: '啞鈴' },
  { id: 'machine', label: '機械', prefix: '機械' }, // 插銷式
  { id: 'plate_loaded', label: '掛片式', prefix: '掛片式' }, // Plate-loaded
  { id: 'cable', label: '鋼索', prefix: '鋼索' },
  { id: 'smith', label: '史密斯', prefix: '史密斯' },
  { id: 'bodyweight', label: '徒手', prefix: '徒手' },
  { id: 'kettlebell', label: '壺鈴', prefix: '壺鈴' },
];

export const MUSCLE_GROUPS = [
  { id: 'chest', label: '胸部' },
  { id: 'back', label: '背部' },
  { id: 'legs', label: '腿部' },
  { id: 'shoulders', label: '肩部' },
  { id: 'arms', label: '手臂' },
  { id: 'core', label: '核心' },
];

export const MOVEMENT_LIBRARY: Record<string, string[]> = {
  chest: ['臥推', '上胸臥推', '下胸臥推', '飛鳥', '夾胸', '伏地挺身'],
  back: ['划船', '下拉', '引體向上', '單臂划船', '直臂下壓', '面拉'],
  legs: ['深蹲', '硬舉', '腿推', '分腿蹲', '腿屈伸', '腿後勾', '提踵'],
  shoulders: ['肩推', '側平舉', '前平舉', '後三角飛鳥', '聳肩'],
  arms: ['二頭彎舉', '三頭下壓', '法式推舉', '錘式彎舉', '窄距臥推'],
  core: ['捲腹', '棒式', '俄羅斯轉體', '抬腿'],
};
