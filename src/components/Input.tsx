import React, { ChangeEvent } from 'react';

interface InputProps {
    icon?: any;
    type: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({ icon, type, value, onChange }) => {
    return (
        <div className="relative">
            {icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {icon}
                </div>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                className="pl-10 pr-3 py-2 border border-green-400 bg-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
            />
        </div>
    );
};

export default Input;