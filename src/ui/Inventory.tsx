import React from 'react';
import { globals } from '../utils';
import { setRemoveHelmet, switchWeapon, setRemoveArmor } from '../Concepts'

interface IInventoryProps {
    //toggleOpenUI: ()=> void;
    setUiOpen: (open: boolean) => void
}

export const Inventory = (props: IInventoryProps) => {

    const handleCloseClick = () => {

        props.setUiOpen(false);
        globals.isInventoryMode = false;
    }

    const handleRemoveHelmet = () => {
        setRemoveHelmet(true)
    }

    const handlePutHelmet = () => {
        setRemoveHelmet(false)
    }

    const handleChangeWeapon = () => {
        switchWeapon();
    }

    const handlePutArmor = () => {
        setRemoveArmor(false)
    }

    const handleRemoveArmor = () => {
        setRemoveArmor(true)
    }

    return (
        <>

            <div className='ui'>
                <div className='ui-header'>Chest
                <button className='ui-button close-button' onClick={handleCloseClick}>x</button>
                </div>

                <button className='ui-button' onClick={handleRemoveHelmet}>Remove Helmet</button>
                <button className='ui-button' onClick={handlePutHelmet}>Put Helmet</button>
                <button className='ui-button' onClick={handleChangeWeapon}>Change Weapon</button>

                <button className='ui-button' onClick={handlePutArmor}>Put Armor</button>
                <button className='ui-button' onClick={handleRemoveArmor}>Remove Armor</button>
            </div>
        </>
    )
}



