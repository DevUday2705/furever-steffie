export const traditionalOptions = [
    {
        id: 1,
        name: "Golden Paw Kurta",
        price: "799",
        img: "/images/1.webp",
    },
    {
        id: 2,
        name: "Sunny Tail Kurta",
        price: "799",
        img: "/images/2.webp",
    },
    {
        id: 3,
        name: "Furever Sunshine",
        price: "799",
        img: "/images/3.webp",
    },
    {
        id: 4,
        name: "Lemon Glow Kurta",
        price: "799",
        img: "/images/4.webp",
    },
    {
        id: 5,
        name: "Sunbeam Chic",
        price: "799",
        img: "/images/5.webp",
    },
    {
        id: 6,
        name: "Woof Attire",
        price: "799",
        img: "/images/6.webp",
    },
    {
        id: 7,
        name: "Pawfect Yellow",
        price: "799",
        img: "/images/7.webp",
    },
    {
        id: 8,
        name: "Bright Pup Kurta",
        price: "799",
        img: "/images/8.webp",
    },
];


export const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            delayChildren: 0.2,
            staggerChildren: 0.1
        }
    }
};

export const itemVariants = {
    hidden: {
        opacity: 0,
        y: 50
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5
        }
    }
};

