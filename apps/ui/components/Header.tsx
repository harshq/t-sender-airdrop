import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header: React.FC = () => {
    return (
        <header className='p-3 bg-blue-200 border-b-2 border-b-blue-300 min-h-[67px]'>
            <div className='container flex justify-between mx-auto'>
                <div className='flex-1 max-w-[200px] rounded-xl'></div>
                <ConnectButton />
            </div>
        </header>
    );
}
export default Header;