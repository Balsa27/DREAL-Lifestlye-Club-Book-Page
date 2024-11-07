import { atom, useAtom } from "jotai";
import {useEffect} from "react";

const pictures = [
    "STEVO-02",
    "STEVO-03",
    "STEVO-04",
    "STEVO-05",
    "STEVO-06",
    "STEVO-07",
    "STEVO-08",
    "STEVO-09",
    "STEVO-10",
    "STEVO-11",
    "STEVO-12",
    "STEVO-13",
    "STEVO-14",
    "STEVO-15",
    "STEVO-16",
    "STEVO-17",
    "STEVO-18",
    "STEVO-19",
    "STEVO-20",
    "STEVO-21",
    "STEVO-22",
    "STEVO-23",
    "STEVO-24",
    "STEVO-25",
    "STEVO-26",
];

export const isAnimationCompleteAtom = atom(false);
export const pageAtom = atom(0);
export const pages = [
    {
        front: "book-cover",
        back: pictures[0],
    },
];

for (let i = 1; i < pictures.length - 1; i += 2) {
    pages.push({
        front: pictures[i % pictures.length],
        back: pictures[(i + 1) % pictures.length],
    });
}

pages.push({
    front: pictures[pictures.length - 1],
    back: "book-back",
});

export const UI = () => {
    const [page, setPage] = useAtom(pageAtom);

    useEffect(() => {
        const audio = new Audio("/audios/page-flip-01a.mp3");
        audio.play().then(r => console.log('Playing.'));
    }, [page]);
}