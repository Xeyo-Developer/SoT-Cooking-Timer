export const BACKGROUNDS = [
    'BG0',
    'BG1',
    'BG2',
    'BG3',
    'BG4',
    'BG5',
    'BG6',
    'BG7',
    'BG8',
    'BG9',
    'BG10',
    'BG11',
    'BG12',
    'BG13',
    'BG14',
    'BG15',
    'BG16',
    'BG17',
    'BG18',
    'BG19',
    'BG20',
    'BG21',
    'BG22',
    'BG23',
    'BG24',
    'BG25',
    'BG26',
    'BG27',
    'BG28',
    'BG29',
    'BG30',
    'BG31'
] as const;

export type BackgroundName = typeof BACKGROUNDS[number];

export function getRandomBackground(): BackgroundName {
    const randomIndex = Math.floor(Math.random() * BACKGROUNDS.length);
    return BACKGROUNDS[randomIndex];
}

export function getBackgroundPath(backgroundName: BackgroundName): string {
    return `./backgrounds/${backgroundName}.jpg`;
}

export function setBackground(backgroundName: BackgroundName): void {
    const path = getBackgroundPath(backgroundName);
    console.log('Ustawiam tło:', path);
    document.body.style.backgroundImage = `url('${path}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';
}

export function setRandomBackground(): BackgroundName {
    const newBackground = getRandomBackground();
    setBackground(newBackground);
    return newBackground;
}