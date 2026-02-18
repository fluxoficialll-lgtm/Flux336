
import React from 'react';

interface GroupBasicInfoProps {
    groupName: string;
    setGroupName: (name: string) => void;
    description: string;
    setDescription: (desc: string) => void;
    coverImage: string | undefined;
    handleCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const GroupBasicInfo: React.FC<GroupBasicInfoProps> = ({ 
    groupName, setGroupName, description, setDescription, coverImage, handleCoverChange 
}) => {
    return (
        <>
            <div className="cover-upload-container">
                <label htmlFor="coverImageInput" className="cover-preview">
                    {coverImage ? <img src={coverImage} alt="Cover" /> : <i className="fa-solid fa-crown cover-icon"></i>}
                </label>
                <label htmlFor="coverImageInput" className="cover-label">Capa Principal</label>
                <input type="file" id="coverImageInput" accept="image/*" style={{display: 'none'}} onChange={handleCoverChange} />
            </div>

            <div className="form-group">
                <label htmlFor="groupName">Nome do Grupo</label>
                <input type="text" id="groupName" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Ex: Comunidade Flux Pro" required />
            </div>
            
            <div className="form-group">
                <label htmlFor="groupDescription">Descrição</label>
                <textarea id="groupDescription" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Sobre o que é este grupo?"></textarea>
            </div>
        </>
    );
};
