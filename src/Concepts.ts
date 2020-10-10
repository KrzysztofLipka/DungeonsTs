import { globals } from './utils';

export const setRemoveHelmet = (remove: boolean) => {
    const helmet = globals.player.transform.children[0].children[0].children.filter(child => child.name === 'Helmet')[0];
    helmet.visible = !remove;
}

export const switchWeapon = () => {
    const pickaxe = globals.player.transform.children[0].children[0].children.filter(child => child.name === 'Sword')[0];
    const axe = globals.player.transform.children[0].children[0].children.filter(child => child.name === 'Pickaxe')[0];

    pickaxe.visible = !pickaxe.visible;
    axe.visible = !axe.visible;
}

export const setRemoveArmor = (remove: boolean) => {
    const armor = globals.player.transform.children[0].children[0].children.filter(child => child.name === 'Armor')[0];
    armor.visible = !remove;
}
