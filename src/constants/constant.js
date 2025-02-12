export const traditionalOptions = [{
    id: 1,
    name: "Golden Paw Kurta",
    price: "799",
    image: "/images/1/1.jpg",
    description: "Traditional ethnic wear with modern twist",
    variants: [
        {
            id: "1-2",
            name: "Pure Cotton",
            image: "/images/1/2.jpg",
            price: "999",
            sizes: [
                { size: "S", inStock: true, price: "999" },
                { size: "M", inStock: true, price: "999" },
                { size: "L", inStock: true, price: "1049" },
                { size: "XL", inStock: true, price: "1049" }
            ]
        },
        {
            id: "1-3",
            name: "Silk Blend",
            image: "/images/1/3.jpg",
            price: "1299",
            sizes: [
                { size: "S", inStock: true, price: "1299" },
                { size: "M", inStock: true, price: "1299" },
                { size: "L", inStock: true, price: "1349" },
                { size: "XL", inStock: true, price: "1349" }
            ]
        }
    ],
    sizes: [
        { size: "S", inStock: true, price: "799" },
        { size: "M", inStock: true, price: "799" },
        { size: "L", inStock: true, price: "849" },
        { size: "XL", inStock: false, price: "849" }
    ],
},
{
    id: 2,
    name: "Royal Sherwani",
    price: "999",
    image: "/images/2/1.jpg",
    description: "Elegant ethnic sherwani for special occasions",
    variants: [
        {
            id: "2-2",
            name: "Premium Cotton",
            image: "/images/2/2.jpg",
            price: "1199",
            sizes: [
                { size: "S", inStock: true, price: "1199" },
                { size: "M", inStock: true, price: "1199" },
                { size: "L", inStock: true, price: "1249" },
                { size: "XL", inStock: true, price: "1249" }
            ]
        },
        {
            id: "2-3",
            name: "Brocade Blend",
            image: "/images/2/3.jpg",
            price: "1499",
            sizes: [
                { size: "S", inStock: true, price: "1499" },
                { size: "M", inStock: true, price: "1499" },
                { size: "L", inStock: false, price: "1549" },
                { size: "XL", inStock: true, price: "1549" }
            ]
        }
    ],
    sizes: [
        { size: "S", inStock: true, price: "999" },
        { size: "M", inStock: true, price: "999" },
        { size: "L", inStock: true, price: "1049" },
        { size: "XL", inStock: true, price: "1049" }
    ],
}]


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

