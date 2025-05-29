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
    SKILL_LEVEL_LABELS, 
    VOCAL_RANGE_LABELS 
} from '../../types';
import './MusicianForm.css';

interface MusicianFormProps {
    onSubmit: (data: Musician) => void;
    initialData?: Musician; 
    onCancelEdit?: () => void; 
}

// Helper to create a new empty instrument with default values
const defaultVocalistRole: MusicianRole = 'vocalist';
const defaultPopMusicStyle: MusicStyle = 'pop';
const defaultSkillLevel3: SkillLevel = 3;
const defaultFemaleVocalType: VocalType = 'female';
const defaultVersatileVocalRange: VocalRange = 'versatile';

const createNewInstrument = (): InstrumentDetail => ({
    role: defaultVocalistRole,
    primaryStyle: defaultPopMusicStyle,
    skillLevel: defaultSkillLevel3,
    vocalType: defaultFemaleVocalType,
    vocalRange: defaultVersatileVocalRange,
    canPlayLead: false,
    canPlayRhythm: false,
    preferredDrumKit: '',
    keyboardSounds: [] as string[], // Explicitly type empty array as string[]
});

// Helper to create default form values for a new musician
const defaultRockMusicStyle: MusicStyle = 'rock';
const createDefaultMusicianValues = (): Musician => ({
    id: uuidv4(),
    name: '',
    description: '',
    instruments: [createNewInstrument()],
    overallPrimaryStyle: defaultRockMusicStyle,
});

const MusicianForm: React.FC<MusicianFormProps> = ({ onSubmit, initialData, onCancelEdit }) => {
    const { register, control, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm<Musician>({
        defaultValues: initialData || {
            id: uuidv4(),
            name: '',
            description: '',
            overallPrimaryStyle: '' as MusicStyle,
            instruments: [{ 
                role: '' as MusicianRole, 
                primaryStyle: '' as MusicStyle, 
                skillLevel: '' as SkillLevel,
                // Vocal specific
                vocalType: undefined,
                vocalRange: undefined,
                // Guitar/Bass specific
                canPlayLead: undefined,
                canPlayRhythm: undefined,
                // Drum specific
                preferredDrumKit: '',
                // Keyboard specific
                keyboardSounds: []
            }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "instruments"
    });

    const [isEditing, setIsEditing] = useState(!!initialData);

    useEffect(() => {
        if (initialData) {
            reset(initialData); // Populate form with initialData when it's provided for editing
            setIsEditing(true);
        } else {
            reset({ // Reset to new UUID and empty fields if not editing
                id: uuidv4(),
                name: '',
                description: '',
                overallPrimaryStyle: '' as MusicStyle,
                instruments: [{ 
                    role: '' as MusicianRole, 
                    primaryStyle: '' as MusicStyle, 
                    skillLevel: '' as SkillLevel 
                }]
            });
            setIsEditing(false);
        }
    }, [initialData, reset]);
    
    const handleFormSubmit = (data: Musician) => {
        onSubmit(data);
        if (!isEditing) { // Only reset fully if it was a new submission
            reset({
                id: uuidv4(), // Generate new ID for the next potential musician
                name: '',
                description: '',
                overallPrimaryStyle: '' as MusicStyle,
                instruments: [{ 
                    role: '' as MusicianRole, 
                    primaryStyle: '' as MusicStyle, 
                    skillLevel: '' as SkillLevel 
                }]
            });
        }
        // If editing, the parent component (CreateMusicianPage) handles clearing the editing state
        // and the key prop on MusicianForm will cause a re-mount with fresh state or no initialData
    };

    const instrumentWatch = watch("instruments");

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="musician-form-actual" noValidate>
            <h2>{isEditing ? '編輯音樂家' : '新增音樂家'}</h2>
            
            {/* Hidden ID field, useful if we were to submit to a real backend that might not use UUIDs from client */}
            {/* <input type="hidden" {...register("id")} /> */}

            <div className="form-group">
                <label htmlFor="name">音樂家名稱 <span className="required-asterisk">*</span></label>
                <input 
                    id="name"
                    {...register("name", { required: "音樂家名稱為必填欄位" })} 
                    placeholder="例如：幻想主唱、搖滾吉他之神"
                    aria-invalid={errors.name ? "true" : "false"}
                    autoComplete="musician-name"
                />
                {errors.name && <p role="alert" className="error-message">{errors.name.message}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="musicianDescription">簡短描述 (選填)</label>
                <textarea 
                    id="musicianDescription" 
                    {...register("description")} 
                    autoComplete="off"
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="overallPrimaryStyle">整體主要風格 (選填)</label>
                <select id="overallPrimaryStyle" {...register("overallPrimaryStyle")} autoComplete="off">
                    <option value="">選擇風格</option>
                    {(Object.keys(MUSIC_STYLE_LABELS) as MusicStyle[]).map(style => (
                        <option key={style} value={style}>{MUSIC_STYLE_LABELS[style]}</option>
                    ))}
                </select>
            </div>

            <h4>樂器/角色專長</h4>
            {fields.map((fieldItem, index) => {
                const instrumentPath = `instruments.${index}` as const;
                const currentRole = watch(`${instrumentPath}.role`);
                const fieldIdPrefix = `instruments[${index}]`;
                
                return (
                    <div key={fieldItem.id} className="instrument-details-group">
                        <div className="instrument-header">
                            <h4>專長 #{index + 1}</h4>
                            {fields.length > 1 && (
                                <button type="button" onClick={() => remove(index)} className="btn btn-danger btn-small">移除此專長</button>
                            )}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor={`${fieldIdPrefix}.role`}>角色/樂器</label>
                            <select 
                                id={`${fieldIdPrefix}.role`} 
                                {...register(`${instrumentPath}.role`, { required: "角色為必填" })}
                                autoComplete="off"
                            >
                                {(Object.keys(MUSICIAN_ROLE_LABELS) as MusicianRole[]).map(role => (
                                    <option key={role} value={role}>{MUSICIAN_ROLE_LABELS[role]}</option>
                                ))}
                            </select>
                            {errors.instruments?.[index]?.role && <p className="error-message">{errors.instruments[index]?.role?.message as string}</p>}
                        </div>

                        {currentRole === 'vocalist' && (
                            <>
                                <div className="form-group">
                                    <label htmlFor={`${fieldIdPrefix}.vocalType`}>性別</label>
                                    <select id={`${fieldIdPrefix}.vocalType`} {...register(`${instrumentPath}.vocalType`)} autoComplete="off">
                                        <option value="female">女</option>
                                        <option value="male">男</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor={`${fieldIdPrefix}.vocalRange`}>音域</label>
                                    <select id={`${fieldIdPrefix}.vocalRange`} {...register(`${instrumentPath}.vocalRange`)} autoComplete="off">
                                        {(Object.keys(VOCAL_RANGE_LABELS) as VocalRange[]).map(range => (
                                            <option key={range} value={range}>{VOCAL_RANGE_LABELS[range]}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label htmlFor={`${fieldIdPrefix}.primaryStyle`}>主要風格 (此專長)</label>
                            <select id={`${fieldIdPrefix}.primaryStyle`} {...register(`${instrumentPath}.primaryStyle`)} autoComplete="off">
                                <option value="">選擇風格</option>
                                {(Object.keys(MUSIC_STYLE_LABELS) as MusicStyle[]).map(style => (
                                    <option key={style} value={style}>{MUSIC_STYLE_LABELS[style]}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor={`${fieldIdPrefix}.skillLevel`}>技能等級 (1-5)</label>
                            <select id={`${fieldIdPrefix}.skillLevel`} {...register(`${instrumentPath}.skillLevel`, { valueAsNumber: true })} autoComplete="off">
                                {(Object.keys(SKILL_LEVEL_LABELS) as unknown as SkillLevel[]).map(level => (
                                    <option key={level} value={level}>{SKILL_LEVEL_LABELS[level]}</option>
                                ))}
                            </select>
                        </div>
                        
                        {(currentRole === 'guitarist' || currentRole === 'electric_guitarist' || currentRole === 'bassist') && (
                            <>
                                <div className="form-group checkbox-group">
                                    {/* ID for checkbox needs to be unique for the label to target it correctly */}
                                    <input type="checkbox" id={`${fieldIdPrefix}.canPlayLead`} {...register(`${instrumentPath}.canPlayLead`)} />
                                    <label htmlFor={`${fieldIdPrefix}.canPlayLead`}>可演奏主音 (Lead)</label>
                                </div>
                                <div className="form-group checkbox-group">
                                    <input type="checkbox" id={`${fieldIdPrefix}.canPlayRhythm`} {...register(`${instrumentPath}.canPlayRhythm`)} />
                                    <label htmlFor={`${fieldIdPrefix}.canPlayRhythm`}>可演奏節奏 (Rhythm)</label>
                                </div>
                            </>
                        )}
                         {currentRole === 'drummer' && (
                             <div className="form-group">
                                <label htmlFor={`${fieldIdPrefix}.preferredDrumKit`}>偏好鼓組 (選填)</label>
                                <input type="text" id={`${fieldIdPrefix}.preferredDrumKit`} {...register(`${instrumentPath}.preferredDrumKit`)} placeholder="例如：Standard Rock Kit" autoComplete="off"/>
                            </div>
                        )}
                        {currentRole === 'keyboardist' && (
                             <div className="form-group">
                                <label htmlFor={`${fieldIdPrefix}.keyboardSounds`}>常用音色 (選填，逗號分隔)</label>
                                <input 
                                    type="text" 
                                    id={`${fieldIdPrefix}.keyboardSounds`} 
                                    {...register(`${instrumentPath}.keyboardSounds`, {
                                        setValueAs: (value: string | string[]) => 
                                            typeof value === 'string' ? value.split(',').map(s => s.trim()).filter(s => s) : value,
                                        })} 
                                    placeholder="例如：Piano, Synth Pad, Organ"
                                    autoComplete="off"
                                />
                            </div>
                        )}
                    </div>
                );
            })}

            <div className="button-group">
                <button 
                    type="button" 
                    onClick={() => append(createNewInstrument())} 
                    className="btn btn-secondary"
                >
                    新增樂器/專長
                </button>
            </div>

            <div className="form-actions">
                <button type="submit" className="btn btn-primary">{isEditing ? '儲存變更' : '新增音樂家'}</button>
                {isEditing && onCancelEdit && (
                    <button type="button" onClick={() => {
                        onCancelEdit();
                        // Optionally, reset form to a clean state if needed, though remounting via key is preferred
                        // reset({ id: uuidv4(), name: '', description: '', overallPrimaryStyle: '', instruments: [{ role: '', primaryStyle: '', skillLevel: ''}] });
                    }} className="btn btn-secondary">取消編輯</button>
                )}
            </div>
        </form>
    );
};

export default MusicianForm; 