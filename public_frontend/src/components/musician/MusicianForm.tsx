import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import type { 
    Musician, 
    InstrumentDetail,
    MusicianRole, 
    MusicStyle, 
    SkillLevel, 
    VocalType,
    VocalRange 
} from '../../types';
import { 
    MUSICIAN_ROLE_LABELS, 
    MUSIC_STYLE_LABELS, 
    SKILL_LEVEL_OPTIONS,
    VOCAL_RANGE_LABELS,
    VOCAL_RANGE_NOTE_MAP
} from '../../types';
// import './MusicianForm.css'; // Removed

interface MusicianFormProps {
    onSubmit: (data: Musician) => void;
    initialData?: Musician; 
    onCancelEdit?: () => void; 
}

const createDefaultInstrument = (): InstrumentDetail => ({
    role: '' as unknown as MusicianRole, // Keep for react-hook-form, will be validated
    primaryStyle: undefined as MusicStyle | undefined,
    skillLevel: undefined as SkillLevel | undefined,
    vocalType: undefined as VocalType | undefined,
    vocalRange: undefined as VocalRange | undefined,
    preciseLowestNote: '',
    preciseHighestNote: '',
    canPlayLead: false,
    canPlayRhythm: false,
    preferredDrumKit: '',
    keyboardSounds: [] as string[],
});

// Tailwind class definitions
const labelClasses = "block text-sm font-medium text-secondary mb-1";
const inputBaseClasses = "block w-full bg-card-slot border-border-main rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-text-main placeholder-gray-500";
const selectClasses = `${inputBaseClasses}`;
const inputClasses = `${inputBaseClasses}`;
const textareaClasses = `${inputBaseClasses} min-h-[80px]`;
const errorMessageClasses = "text-xs text-error mt-1";

const buttonBaseClasses = "py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 uppercase tracking-wider";
const buttonPrimaryClasses = `${buttonBaseClasses} bg-primary text-text-inverted border-primary hover:bg-tertiary hover:border-tertiary focus:ring-primary`;
const buttonSecondaryClasses = `${buttonBaseClasses} bg-transparent text-tertiary border-tertiary hover:bg-tertiary hover:text-text-inverted focus:ring-tertiary`;
const buttonDangerClasses = `${buttonBaseClasses} bg-transparent text-error border-error hover:bg-error hover:text-white focus:ring-error`;
const buttonSmallClasses = "py-1 px-2 text-xs";

const MusicianForm: React.FC<MusicianFormProps> = ({ onSubmit, initialData, onCancelEdit }) => {
    const { register, control, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm<Musician>({
        defaultValues: initialData 
            ? JSON.parse(JSON.stringify(initialData)) 
            : {
                id: uuidv4(),
                name: '',
                description: '',
                overallPrimaryStyle: undefined as MusicStyle | undefined,
                instruments: [createDefaultInstrument()],
            }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "instruments"
    });

    const [isEditing, setIsEditing] = useState(!!initialData);

    useEffect(() => {
        if (initialData) {
            reset(JSON.parse(JSON.stringify(initialData)));
            setIsEditing(true);
        } else {
            reset({
                id: uuidv4(),
                name: '',
                description: '',
                overallPrimaryStyle: undefined as MusicStyle | undefined,
                instruments: [createDefaultInstrument()],
            });
            setIsEditing(false);
        }
    }, [initialData, reset]);
    
    const localHandleSubmit = (data: Musician) => {
        const processedData = {
            ...data,
            overallPrimaryStyle: (data.overallPrimaryStyle as string) === '' ? undefined : data.overallPrimaryStyle as MusicStyle | undefined,
            instruments: data.instruments.map(inst => {
                const skillLevelFromForm = inst.skillLevel as unknown as number | undefined;
                return {
                    ...inst,
                    primaryStyle: (inst.primaryStyle as string) === '' ? undefined : inst.primaryStyle as MusicStyle | undefined,
                    skillLevel: (skillLevelFromForm === undefined || isNaN(skillLevelFromForm)) ? undefined : skillLevelFromForm as SkillLevel,
                    vocalType: (inst.vocalType as string) === '' ? undefined : inst.vocalType as VocalType | undefined,
                    vocalRange: (inst.vocalRange as string) === '' ? undefined : inst.vocalRange as VocalRange | undefined,
                    preciseLowestNote: inst.preciseLowestNote?.trim() === '' ? undefined : inst.preciseLowestNote?.trim(),
                    preciseHighestNote: inst.preciseHighestNote?.trim() === '' ? undefined : inst.preciseHighestNote?.trim(),
                };
            })
        };
        onSubmit(processedData);
        if (!isEditing) {
            reset({
                id: uuidv4(),
                name: '',
                description: '',
                overallPrimaryStyle: undefined as MusicStyle | undefined,
                instruments: [createDefaultInstrument()],
            });
        }
    };

    // const instrumentWatch = watch("instruments"); // Can be used if specific conditional logic based on all instruments array is needed

    return (
        <form onSubmit={handleSubmit(localHandleSubmit)} className="space-y-6" noValidate>
            <h2 className="text-2xl font-serif font-bold text-primary text-center mb-8">
              {isEditing ? '編輯音樂家' : '新增音樂家'}
            </h2>
            
            <div className="form-group">
                <label htmlFor="name" className={labelClasses}>
                  音樂家名稱 <span className="text-primary font-bold">*</span>
                </label>
                <input 
                    id="name"
                    type="text"
                    {...register("name", { required: "音樂家名稱為必填欄位" })} 
                    className={`${inputClasses} ${errors.name ? 'border-error focus:border-error focus:ring-error' : ''}`}
                    placeholder="例如：幻想主唱、搖滾吉他之神"
                    aria-invalid={errors.name ? "true" : "false"}
                    autoComplete="musician-name"
                />
                {errors.name && <p role="alert" className={errorMessageClasses}>{errors.name.message}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="musicianDescription" className={labelClasses}>簡短描述 (選填)</label>
                <textarea 
                    id="musicianDescription" 
                    {...register("description")} 
                    className={textareaClasses}
                    autoComplete="off"
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="overallPrimaryStyle" className={labelClasses}>整體主要風格 (選填)</label>
                <select 
                    id="overallPrimaryStyle"
                    {...register("overallPrimaryStyle")}
                    className={selectClasses}
                    autoComplete="musician-overall-style"
                    defaultValue=""
                >
                    <option value="">選擇風格</option>
                    {(Object.keys(MUSIC_STYLE_LABELS) as Array<keyof typeof MUSIC_STYLE_LABELS>).map(key => (
                        <option key={key} value={key}>{MUSIC_STYLE_LABELS[key]}</option>
                    ))}
                </select>
            </div>

            <h3 className="text-xl font-serif font-semibold text-secondary pt-4 border-b border-border-main pb-2 mb-6">
              樂器/角色專長
            </h3>
            {fields.map((fieldItem, index) => {
                const instrumentPath = `instruments.${index}` as const;
                const currentRole = watch(`${instrumentPath}.role`);
                const currentVocalRange = watch(`${instrumentPath}.vocalRange`);
                const fieldIdPrefix = `instruments[${index}]`;
                
                useEffect(() => {
                    if (currentRole === 'vocalist' && currentVocalRange && VOCAL_RANGE_NOTE_MAP[currentVocalRange as VocalRange]) {
                        const { lowest, highest } = VOCAL_RANGE_NOTE_MAP[currentVocalRange as VocalRange];
                        setValue(`${instrumentPath}.preciseLowestNote`, lowest, { shouldValidate: true, shouldDirty: true });
                        setValue(`${instrumentPath}.preciseHighestNote`, highest, { shouldValidate: true, shouldDirty: true });
                    }
                }, [currentVocalRange, currentRole, index, setValue, instrumentPath]);
                
                return (
                    <div key={fieldItem.id} className="bg-card-slot/50 p-4 rounded-md space-y-4 mb-6 border border-border-main/50">
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-serif font-medium text-primary">專長 #{index + 1}</h4>
                            {fields.length > 1 && (
                                <button 
                                  type="button" 
                                  onClick={() => remove(index)} 
                                  className={`${buttonDangerClasses} ${buttonSmallClasses}`}
                                >
                                  移除此專長
                                </button>
                            )}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor={`${fieldIdPrefix}.role`} className={labelClasses}>角色/樂器 <span className="text-primary font-bold">*</span></label>
                            <select 
                                id={`${fieldIdPrefix}.role`}
                                {...register(`${instrumentPath}.role` as const, { required: "角色為必填" })}
                                className={`${selectClasses} ${errors.instruments?.[index]?.role ? 'border-error focus:border-error focus:ring-error' : ''}`}
                                aria-invalid={errors.instruments?.[index]?.role ? "true" : "false"}
                                autoComplete={`musician-instrument-${index}-role`}
                                defaultValue=""
                            >
                                <option value="">選擇角色</option>
                                {(Object.keys(MUSICIAN_ROLE_LABELS) as Array<keyof typeof MUSICIAN_ROLE_LABELS>).map(key => (
                                    <option key={key} value={key}>{MUSICIAN_ROLE_LABELS[key]}</option>
                                ))}
                            </select>
                            {errors.instruments?.[index]?.role && <p className={errorMessageClasses}>{errors.instruments[index]?.role?.message as string}</p>}
                        </div>

                        {currentRole === 'vocalist' && (
                            <>
                                <div className="form-group">
                                    <label htmlFor={`${fieldIdPrefix}.vocalType`} className={labelClasses}>性別 (主唱)</label>
                                    <select 
                                        id={`${fieldIdPrefix}.vocalType`} 
                                        {...register(`${instrumentPath}.vocalType` as const)}
                                        className={selectClasses}
                                        autoComplete={`musician-instrument-${index}-vocal-type`}
                                        defaultValue=""
                                    >
                                        <option value="">選擇性別</option>
                                        <option value="male">男</option>
                                        <option value="female">女</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor={`${fieldIdPrefix}.vocalRange`} className={labelClasses}>音域描述 (主唱)</label>
                                    <select 
                                        id={`${fieldIdPrefix}.vocalRange`} 
                                        {...register(`${instrumentPath}.vocalRange` as const)}
                                        className={selectClasses}
                                        autoComplete={`musician-instrument-${index}-vocal-range`}
                                        defaultValue=""
                                    >
                                        <option value="">選擇音域描述</option>
                                        {(Object.keys(VOCAL_RANGE_LABELS) as Array<keyof typeof VOCAL_RANGE_LABELS>).map(key => (
                                            <option key={key} value={key}>{VOCAL_RANGE_LABELS[key]}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                    <div className="form-group">
                                        <label htmlFor={`${fieldIdPrefix}.preciseLowestNote`} className={labelClasses}>精確最低音 (選填)</label>
                                        <input 
                                            id={`${fieldIdPrefix}.preciseLowestNote`}
                                            type="text"
                                            {...register(`${instrumentPath}.preciseLowestNote` as const)} 
                                            className={inputClasses}
                                            placeholder="例如: C3"
                                            autoComplete={`musician-instrument-${index}-lowest-note`}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor={`${fieldIdPrefix}.preciseHighestNote`} className={labelClasses}>精確最高音 (選填)</label>
                                        <input 
                                            id={`${fieldIdPrefix}.preciseHighestNote`}
                                            type="text"
                                            {...register(`${instrumentPath}.preciseHighestNote` as const)} 
                                            className={inputClasses}
                                            placeholder="例如: G5"
                                            autoComplete={`musician-instrument-${index}-highest-note`}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label htmlFor={`${fieldIdPrefix}.primaryStyle`} className={labelClasses}>主要風格 (此專長)</label>
                            <select 
                                id={`${fieldIdPrefix}.primaryStyle`}
                                {...register(`${instrumentPath}.primaryStyle` as const)}
                                className={selectClasses}
                                autoComplete={`musician-instrument-${index}-style`}
                                defaultValue=""
                            >
                                <option value="">選擇風格</option>
                                {(Object.keys(MUSIC_STYLE_LABELS) as Array<keyof typeof MUSIC_STYLE_LABELS>).map(key => (
                                    <option key={key} value={key}>{MUSIC_STYLE_LABELS[key]}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor={`${fieldIdPrefix}.skillLevel`} className={labelClasses}>技能等級</label>
                            <select 
                                id={`${fieldIdPrefix}.skillLevel`}
                                {...register(`${instrumentPath}.skillLevel` as const, { valueAsNumber: true })}
                                className={selectClasses}
                                autoComplete={`musician-instrument-${index}-skill-level`}
                                defaultValue=""
                            >
                                <option value="">選擇等級</option>
                                {SKILL_LEVEL_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        
                        {(currentRole === 'guitarist' || currentRole === 'electric_guitarist' || currentRole === 'bassist') && (
                            <div className="space-y-2 mt-2">
                                <label className={labelClasses}>吉他/貝斯選項:</label>
                                <div className="flex items-center">
                                    <input 
                                        id={`${fieldIdPrefix}.canPlayLead`} 
                                        type="checkbox" 
                                        {...register(`${instrumentPath}.canPlayLead` as const)} 
                                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mr-2"
                                    />
                                    <label htmlFor={`${fieldIdPrefix}.canPlayLead`} className="text-sm text-text-main">可演奏主音 (Lead)</label>
                                </div>
                                <div className="flex items-center">
                                    <input 
                                        id={`${fieldIdPrefix}.canPlayRhythm`} 
                                        type="checkbox" 
                                        {...register(`${instrumentPath}.canPlayRhythm` as const)} 
                                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mr-2"
                                    />
                                    <label htmlFor={`${fieldIdPrefix}.canPlayRhythm`} className="text-sm text-text-main">可演奏節奏 (Rhythm)</label>
                                </div>
                            </div>
                        )}
                         {currentRole === 'drummer' && (
                            <div className="form-group">
                                <label htmlFor={`${fieldIdPrefix}.preferredDrumKit`} className={labelClasses}>偏好鼓組型號 (選填)</label>
                                <input 
                                    id={`${fieldIdPrefix}.preferredDrumKit`}
                                    type="text"
                                    {...register(`${instrumentPath}.preferredDrumKit` as const)} 
                                    className={inputClasses}
                                    placeholder="例如：Standard Rock Kit, Jazz Fusion Kit"
                                    autoComplete={`musician-instrument-${index}-drum-kit`}
                                />
                            </div>
                        )}
                        {currentRole === 'keyboardist' && (
                            <div className="form-group">
                                <label htmlFor={`${fieldIdPrefix}.keyboardSounds`} className={labelClasses}>常用鍵盤音色 (選填，用逗號分隔)</label>
                                <Controller
                                    name={`${instrumentPath}.keyboardSounds` as const}
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            id={`${fieldIdPrefix}.keyboardSounds`}
                                            type="text"
                                            value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                                            onChange={(e) => field.onChange(e.target.value ? e.target.value.split(',').map(s => s.trim()) : [])}
                                            className={inputClasses}
                                            placeholder="例如：Piano, Synth Pad, Organ"
                                            autoComplete={`musician-instrument-${index}-keyboard-sounds`}
                                        />
                                    )}
                                />
                            </div>
                        )}
                    </div>
                );
            })}

            <div className="pt-4">
                <button 
                    type="button" 
                    onClick={() => append(createDefaultInstrument())} 
                    className={buttonSecondaryClasses}
                >
                    新增樂器/專長
                </button>
            </div>

            <div className="form-actions flex justify-end space-x-4 pt-6 border-t border-border-main mt-8">
                <button type="submit" className={buttonPrimaryClasses}>{isEditing ? '儲存變更' : '新增音樂家'}</button>
                {isEditing && onCancelEdit && (
                    <button type="button" onClick={() => {
                        if (onCancelEdit) onCancelEdit();
                    }} className={buttonSecondaryClasses}>取消編輯</button>
                )}
            </div>
        </form>
    );
};

export default MusicianForm; 