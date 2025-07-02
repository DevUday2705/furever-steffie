import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const UploadKurtasPage = () => {
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const kurtaData = [
    {
      id: "sk001",
      type: "kurta",
      category: "royal",
      name: "Kamalini Tejasvini",
      dhotis: [
        {
          id: "dhoti-gold",
          name: "Gold",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_00_26_PM_olnc6g.webp",
        },
        {
          id: "dhoti-peacock-green",
          name: "Peacock Green",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_10_32_PM_v9upwc.webp",
        },
        {
          id: "dhoti-black",
          name: "Black",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_03_19_PM_vk0hbe.webp",
        },
      ],
      pricing: {
        basePrice: 1199,
        discountPercent: 10,
        fullSetAdditional: 600,
        beadedAdditional: 100,
        tasselsAdditional: 100,

        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 200,
          L: 400,
          XL: 600,
          XXL: 800,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104216/Photoroom_20250615_230459_vwjaaf.webp",
      options: {
        beaded: {
          images: [],
        },
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104216/Photoroom_20250615_230459_vwjaaf.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104215/ChatGPT_Image_Jun_15_2025_12_38_07_AM_njuxf1.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014074/IMG_2095_w1iepq.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014074/IMG_2096_ut9k4q.webp",
          ],
        },
      },
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      contactForCustomColors: true,
      description:
        "Vibrant purple kurta with traditional tile motifs — perfect for festive occasions and photo-ready moments",
      availableStock: 2,
      isBeadedAvailable: true,
      isNonBeadedAvailable: true,
      priorityScore: 95,
    },
    {
      id: "sk014",
      type: "kurta",
      category: "classic",
      name: "Multi Color Blue",
      dhotis: [
        {
          id: "dhoti-gold",
          name: "Gold",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_00_26_PM_olnc6g.webp",
        },
        {
          id: "dhoti-peacock-green",
          name: "Peacock Green",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_10_32_PM_v9upwc.webp",
        },
        {
          id: "dhoti-black",
          name: "Black",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_03_19_PM_vk0hbe.webp",
        },
      ],
      pricing: {
        basePrice: 1099,
        discountPercent: 10,
        fullSetAdditional: 600,
        beadedAdditional: 100,
        tasselsAdditional: 100,

        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 200,
          L: 400,
          XL: 600,
          XXL: 800,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1750107082/multicolor-blue_n7bnt5.webp",
      options: {
        beaded: {
          images: [],
        },
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750107082/multicolor-blue_n7bnt5.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014076/IMG_2060_sjgm36.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014085/IMG_2059_nesfz0.webp",
          ],
        },
      },
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      contactForCustomColors: true,
      description:
        "Vibrant purple kurta with traditional tile motifs — perfect for festive occasions and photo-ready moments",
      availableStock: 2,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 80,
    },
    {
      id: "sk002",
      type: "kurta",
      category: "royal",
      name: "NeelPushpa Varnika",
      dhotis: [
        {
          id: "dhoti-gold",
          name: "Gold",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_00_26_PM_olnc6g.webp",
        },
        {
          id: "dhoti-peacock-green",
          name: "Peacock Green",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_10_32_PM_v9upwc.webp",
        },
        {
          id: "dhoti-black",
          name: "Black",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_03_19_PM_vk0hbe.webp",
        },
      ],
      pricing: {
        basePrice: 1199,
        discountPercent: 10,
        fullSetAdditional: 600,
        beadedAdditional: 100,
        tasselsAdditional: 100,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 200,
          L: 400,
          XL: 600,
          XXL: 800,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104216/Photoroom_20250615_230355_pucjg2.webp",
      options: {
        beaded: {
          images: [],
        },
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104216/Photoroom_20250615_230355_pucjg2.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104214/ChatGPT_Image_Jun_15_2025_03_38_50_PM_uxhorb.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014056/IMG_1983_unsinn.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014057/IMG_1982_kejlqh.webp",
          ],
        },
      },
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      contactForCustomColors: true,
      description:
        "Vibrant purple kurta with traditional tile motifs — perfect for festive occasions and photo-ready moments",
      availableStock: 2,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 95,
    },
    {
      id: "sk015",
      type: "kurta",
      category: "classic",
      name: "Multi Color Circle",
      dhotis: [
        {
          id: "dhoti-gold",
          name: "Gold",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_00_26_PM_olnc6g.webp",
        },
        {
          id: "dhoti-peacock-green",
          name: "Peacock Green",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_10_32_PM_v9upwc.webp",
        },
        {
          id: "dhoti-black",
          name: "Black",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_03_19_PM_vk0hbe.webp",
        },
      ],
      pricing: {
        basePrice: 1099,
        discountPercent: 10,
        fullSetAdditional: 600,
        beadedAdditional: 100,
        tasselsAdditional: 100,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 200,
          L: 400,
          XL: 600,
          XXL: 800,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1750107081/Multicolor-semi_pziwpn.webp",
      options: {
        beaded: {
          images: [],
        },
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750107081/Multicolor-semi_pziwpn.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014056/IMG_2123_ynkmzd.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014056/IMG_2121_hvptnh.webp",
          ],
        },
      },
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      contactForCustomColors: true,
      description:
        "Vibrant purple kurta with traditional tile motifs — perfect for festive occasions and photo-ready moments",
      availableStock: 2,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 80,
    },
    {
      id: "sk003",
      type: "kurta",
      category: "royal",
      name: "Meghavarna Rajvastra",
      dhotis: [
        {
          id: "dhoti-gold",
          name: "Gold",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_00_26_PM_olnc6g.webp",
        },
        {
          id: "dhoti-peacock-green",
          name: "Peacock Green",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_10_32_PM_v9upwc.webp",
        },
        {
          id: "dhoti-black",
          name: "Black",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_03_19_PM_vk0hbe.webp",
        },
      ],
      pricing: {
        basePrice: 1199,
        discountPercent: 10,
        fullSetAdditional: 600,
        beadedAdditional: 100,
        tasselsAdditional: 100,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 200,
          L: 400,
          XL: 600,
          XXL: 800,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104213/Photoroom_20250615_224952_nzxzgm.webp",
      options: {
        beaded: {
          images: [],
        },
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104213/Photoroom_20250615_224952_nzxzgm.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104213/Photoroom_20250615_224928_o4rwb2.webp",
          ],
        },
      },
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      contactForCustomColors: true,
      description:
        "Vibrant purple kurta with traditional tile motifs — perfect for festive occasions and photo-ready moments",
      availableStock: 2,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 95,
    },
    {
      id: "sk016",
      type: "kurta",
      category: "classic",
      name: "Green Zari",
      dhotis: [
        {
          id: "dhoti-gold",
          name: "Gold",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_00_26_PM_olnc6g.webp",
        },
        {
          id: "dhoti-peacock-green",
          name: "Peacock Green",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_10_32_PM_v9upwc.webp",
        },
        {
          id: "dhoti-black",
          name: "Black",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_03_19_PM_vk0hbe.webp",
        },
      ],
      pricing: {
        basePrice: 1099,
        discountPercent: 10,
        fullSetAdditional: 600,
        beadedAdditional: 100,
        tasselsAdditional: 100,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 200,
          L: 400,
          XL: 600,
          XXL: 800,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1750107084/green-zari-2_nlnnc7.webp",
      options: {
        beaded: {
          images: [],
        },
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750107084/green-zari-2_nlnnc7.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750107079/Green-zari_yckbvo.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014093/IMG_2194_mxdyzs.webp",
          ],
        },
      },
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      contactForCustomColors: true,
      description:
        "Vibrant purple kurta with traditional tile motifs — perfect for festive occasions and photo-ready moments",
      availableStock: 2,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 80,
    },
    {
      id: "sk004",
      type: "kurta",
      category: "royal",
      name: "SuryaKamala Rajvastra",
      dhotis: [
        {
          id: "dhoti-gold",
          name: "Gold",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_00_26_PM_olnc6g.webp",
        },
        {
          id: "dhoti-peacock-green",
          name: "Peacock Green",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_10_32_PM_v9upwc.webp",
        },
        {
          id: "dhoti-black",
          name: "Black",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_03_19_PM_vk0hbe.webp",
        },
      ],
      pricing: {
        basePrice: 1199,
        discountPercent: 10,
        fullSetAdditional: 600,
        beadedAdditional: 100,
        tasselsAdditional: 100,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 200,
          L: 400,
          XL: 600,
          XXL: 800,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104212/Photoroom_20250616_015056_se8lve.webp",
      options: {
        beaded: {
          images: [],
        },
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104212/Photoroom_20250616_015056_se8lve.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014054/IMG_2152_myfhiy.webp",
          ],
        },
      },
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      contactForCustomColors: true,
      description:
        "Vibrant purple kurta with traditional tile motifs — perfect for festive occasions and photo-ready moments",
      availableStock: 2,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 95,
    },
    {
      id: "sk017",
      type: "kurta",
      category: "classic",
      name: "White Floral",
      dhotis: [
        {
          id: "dhoti-gold",
          name: "Gold",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_00_26_PM_olnc6g.webp",
        },
        {
          id: "dhoti-peacock-green",
          name: "Peacock Green",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_10_32_PM_v9upwc.webp",
        },
        {
          id: "dhoti-black",
          name: "Black",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_03_19_PM_vk0hbe.webp",
        },
      ],
      pricing: {
        basePrice: 1099,
        discountPercent: 10,
        fullSetAdditional: 600,
        beadedAdditional: 100,
        tasselsAdditional: 100,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 200,
          L: 400,
          XL: 600,
          XXL: 800,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1750107078/floral-white_uvclcp.webp",
      options: {
        beaded: {
          images: [],
        },
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750107078/floral-white_uvclcp.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751015304/IMG_2106_fnllgv.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751015304/IMG_2107_ugh8z5.webp",
          ],
        },
      },
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      contactForCustomColors: true,
      description:
        "Vibrant purple kurta with traditional tile motifs — perfect for festive occasions and photo-ready moments",
      availableStock: 2,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 80,
    },
    {
      id: "sk005",
      type: "kurta",
      category: "royal",
      name: "Shehzada Green",
      dhotis: [
        {
          id: "dhoti-gold",
          name: "Gold",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_00_26_PM_olnc6g.webp",
        },
        {
          id: "dhoti-peacock-green",
          name: "Peacock Green",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_10_32_PM_v9upwc.webp",
        },
        {
          id: "dhoti-black",
          name: "Black",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_03_19_PM_vk0hbe.webp",
        },
      ],
      pricing: {
        basePrice: 1199,
        discountPercent: 10,
        fullSetAdditional: 600,
        beadedAdditional: 100,
        tasselsAdditional: 100,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 200,
          L: 400,
          XL: 600,
          XXL: 800,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104211/Shehzada_Green_Edition_Royal_kurta_dhoti_xalhxm.webp",
      options: {
        beaded: {
          images: [],
        },
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104211/Shehzada_Green_Edition_Royal_kurta_dhoti_xalhxm.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104212/Shehzada_Green_Edition_Royal_kurta__tssuoj.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014055/IMG_2161_u9cdw0.webp",
          ],
        },
      },
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      contactForCustomColors: true,
      description:
        "Vibrant purple kurta with traditional tile motifs — perfect for festive occasions and photo-ready moments",
      availableStock: 2,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 95,
    },
    {
      id: "sk018",
      type: "kurta",
      category: "classic",
      name: "Multi Color Squares",
      dhotis: [
        {
          id: "dhoti-gold",
          name: "Gold",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_00_26_PM_olnc6g.webp",
        },
        {
          id: "dhoti-peacock-green",
          name: "Peacock Green",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_10_32_PM_v9upwc.webp",
        },
        {
          id: "dhoti-black",
          name: "Black",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_03_19_PM_vk0hbe.webp",
        },
      ],
      pricing: {
        basePrice: 1099,
        discountPercent: 10,
        fullSetAdditional: 600,
        beadedAdditional: 100,
        tasselsAdditional: 100,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 200,
          L: 400,
          XL: 600,
          XXL: 800,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1750107089/Multi-square_k7fy8q.webp",
      options: {
        beaded: {
          images: [],
        },
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750107089/Multi-square_k7fy8q.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014073/IMG_2103_gh16az.webp",
          ],
        },
      },
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      contactForCustomColors: true,
      description:
        "Vibrant purple kurta with traditional tile motifs — perfect for festive occasions and photo-ready moments",
      availableStock: 2,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 80,
    },
    {
      id: "sk006",
      type: "kurta",
      category: "royal",
      name: "Rajwadi Red",
      dhotis: [
        {
          id: "dhoti-gold",
          name: "Gold",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_00_26_PM_olnc6g.webp",
        },
        {
          id: "dhoti-peacock-green",
          name: "Peacock Green",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_10_32_PM_v9upwc.webp",
        },
        {
          id: "dhoti-black",
          name: "Black",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_03_19_PM_vk0hbe.webp",
        },
      ],
      pricing: {
        basePrice: 1199,
        discountPercent: 10,
        fullSetAdditional: 600,
        beadedAdditional: 100,
        tasselsAdditional: 100,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 200,
          L: 400,
          XL: 600,
          XXL: 800,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104210/Rajwadi_Red_royal_Kurta_dhoti_set_for_Dogs_tnx1ie.webp",
      options: {
        beaded: {
          images: [],
        },
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104210/Rajwadi_Red_royal_Kurta_dhoti_set_for_Dogs_tnx1ie.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104210/Rajwadi_Red_Kurta_for_Dogs_2_dljxzj.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104210/Rajwadi_Red_royal_Kurta_for_Dogs_1_z0luws.webp",
          ],
        },
      },
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      contactForCustomColors: true,
      description:
        "Vibrant purple kurta with traditional tile motifs — perfect for festive occasions and photo-ready moments",
      availableStock: 2,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 95,
    },
    {
      id: "sk019",
      type: "kurta",
      category: "classic",
      name: "Yellow Love",
      dhotis: [
        {
          id: "dhoti-gold",
          name: "Gold",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_00_26_PM_olnc6g.webp",
        },
        {
          id: "dhoti-peacock-green",
          name: "Peacock Green",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_10_32_PM_v9upwc.webp",
        },
        {
          id: "dhoti-black",
          name: "Black",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_03_19_PM_vk0hbe.webp",
        },
      ],
      pricing: {
        basePrice: 1099,
        discountPercent: 10,
        fullSetAdditional: 600,
        beadedAdditional: 100,
        tasselsAdditional: 100,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 200,
          L: 400,
          XL: 600,
          XXL: 800,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1750107077/Yellow-love_sadvl8.webp",
      options: {
        beaded: {
          images: [],
        },
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750107077/Yellow-love_sadvl8.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014054/IMG_2152_myfhiy.webp",
          ],
        },
      },
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      contactForCustomColors: true,
      description:
        "Vibrant purple kurta with traditional tile motifs — perfect for festive occasions and photo-ready moments",
      availableStock: 2,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 80,
    },
    {
      id: "sk007",
      type: "kurta",
      category: "royal",
      name: "Gulabi Shehzada",
      dhotis: [
        {
          id: "dhoti-gold",
          name: "Gold",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_00_26_PM_olnc6g.webp",
        },
        {
          id: "dhoti-peacock-green",
          name: "Peacock Green",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_10_32_PM_v9upwc.webp",
        },
        {
          id: "dhoti-black",
          name: "Black",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_03_19_PM_vk0hbe.webp",
        },
      ],
      pricing: {
        basePrice: 1199,
        discountPercent: 10,
        fullSetAdditional: 600,
        beadedAdditional: 100,
        tasselsAdditional: 100,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 200,
          L: 400,
          XL: 600,
          XXL: 800,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104208/Gulaabi_Shehzada_royal_rani_pink_kurta_dhoti__kxxzl3.webp",
      options: {
        beaded: {
          images: [],
        },
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104208/Gulaabi_Shehzada_royal_rani_pink_kurta_dhoti__kxxzl3.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104209/Gulaabi_Shehzada_royal_rani_pink_kurta_ty4jux.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014056/IMG_1381_hyvkef.webp",
          ],
        },
      },
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      contactForCustomColors: true,
      description:
        "Vibrant purple kurta with traditional tile motifs — perfect for festive occasions and photo-ready moments",
      availableStock: 2,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 95,
    },
    {
      id: "sk020",
      type: "kurta",
      category: "classic",
      name: "White gold",
      dhotis: [
        {
          id: "dhoti-gold",
          name: "Gold",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_00_26_PM_olnc6g.webp",
        },
        {
          id: "dhoti-peacock-green",
          name: "Peacock Green",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_10_32_PM_v9upwc.webp",
        },
        {
          id: "dhoti-black",
          name: "Black",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_03_19_PM_vk0hbe.webp",
        },
      ],
      pricing: {
        basePrice: 1099,
        discountPercent: 10,
        fullSetAdditional: 600,
        beadedAdditional: 100,
        tasselsAdditional: 100,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 200,
          L: 400,
          XL: 600,
          XXL: 800,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1750107087/white-zari_cbr8vi.webp",
      options: {
        beaded: {
          images: [],
        },
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750107087/white-zari_cbr8vi.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014054/IMG_2147_zw3v65.webp",
          ],
        },
      },
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      contactForCustomColors: true,
      description:
        "Vibrant purple kurta with traditional tile motifs — perfect for festive occasions and photo-ready moments",
      availableStock: 2,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 80,
    },
    {
      id: "sk008",
      type: "kurta",
      category: "royal",
      name: "Shahenshahi Rangmahal",
      dhotis: [
        {
          id: "dhoti-gold",
          name: "Gold",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_00_26_PM_olnc6g.webp",
        },
        {
          id: "dhoti-peacock-green",
          name: "Peacock Green",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_10_32_PM_v9upwc.webp",
        },
        {
          id: "dhoti-black",
          name: "Black",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_03_19_PM_vk0hbe.webp",
        },
      ],
      pricing: {
        basePrice: 1199,
        discountPercent: 10,
        fullSetAdditional: 600,
        beadedAdditional: 100,
        tasselsAdditional: 100,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 200,
          L: 400,
          XL: 600,
          XXL: 800,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104208/Photoroom_20250615_232608_plxkyf.webp",
      options: {
        beaded: {
          images: [],
        },
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104208/Photoroom_20250615_232608_plxkyf.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104207/ChatGPT_Image_Jun_15_2025_12_50_08_AM_zjtjoc.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014074/IMG_2086_hothly.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014074/IMG_2089_u2m7ay.webp",
          ],
        },
      },
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      contactForCustomColors: true,
      description:
        "Vibrant purple kurta with traditional tile motifs — perfect for festive occasions and photo-ready moments",
      availableStock: 2,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 95,
    },
    {
      id: "sk021",
      type: "kurta",
      category: "classic",
      name: "Floral Blue",
      dhotis: [
        {
          id: "dhoti-gold",
          name: "Gold",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_00_26_PM_olnc6g.webp",
        },
        {
          id: "dhoti-peacock-green",
          name: "Peacock Green",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_10_32_PM_v9upwc.webp",
        },
        {
          id: "dhoti-black",
          name: "Black",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_03_19_PM_vk0hbe.webp",
        },
      ],
      pricing: {
        basePrice: 1099,
        discountPercent: 10,
        fullSetAdditional: 600,
        beadedAdditional: 100,
        tasselsAdditional: 100,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 200,
          L: 400,
          XL: 600,
          XXL: 800,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1750107086/floral-blue_z1dj9g.webp",
      options: {
        beaded: {
          images: [],
        },
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750107086/floral-blue_z1dj9g.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014075/IMG_2067_anaaf8.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014075/IMG_2068_joey1u.webp",
          ],
        },
      },
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      contactForCustomColors: true,
      description:
        "Vibrant purple kurta with traditional tile motifs — perfect for festive occasions and photo-ready moments",
      availableStock: 2,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 80,
    },
    {
      id: "sk009",
      type: "kurta",
      category: "royal",
      name: "Beauty Pink",
      dhotis: [
        {
          id: "dhoti-gold",
          name: "Gold",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_00_26_PM_olnc6g.webp",
        },
        {
          id: "dhoti-peacock-green",
          name: "Peacock Green",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_10_32_PM_v9upwc.webp",
        },
        {
          id: "dhoti-black",
          name: "Black",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_03_19_PM_vk0hbe.webp",
        },
      ],
      pricing: {
        basePrice: 1199,
        discountPercent: 10,
        fullSetAdditional: 600,
        beadedAdditional: 100,
        tasselsAdditional: 100,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 200,
          L: 400,
          XL: 600,
          XXL: 800,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104206/Photoroom_20250616_014910_to7uq3.webp",
      options: {
        beaded: {
          images: [],
        },
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104206/Photoroom_20250616_014910_to7uq3.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014072/IMG_2114_mejpfd.webp",
          ],
        },
      },
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      contactForCustomColors: true,
      description:
        "Vibrant purple kurta with traditional tile motifs — perfect for festive occasions and photo-ready moments",
      availableStock: 2,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 95,
    },
    {
      id: "sk010",
      type: "kurta",
      category: "royal",
      name: "Heritage Leaf",
      dhotis: [
        {
          id: "dhoti-gold",
          name: "Gold",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_00_26_PM_olnc6g.webp",
        },
        {
          id: "dhoti-peacock-green",
          name: "Peacock Green",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_10_32_PM_v9upwc.webp",
        },
        {
          id: "dhoti-black",
          name: "Black",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_03_19_PM_vk0hbe.webp",
        },
      ],
      pricing: {
        basePrice: 1199,
        discountPercent: 10,
        fullSetAdditional: 600,
        beadedAdditional: 100,
        tasselsAdditional: 100,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 200,
          L: 400,
          XL: 600,
          XXL: 800,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104206/Heritage_Leaf_xumnkl.webp",
      options: {
        beaded: {
          images: [],
        },
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104206/Heritage_Leaf_xumnkl.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014074/IMG_2080_djge6g.webp",
          ],
        },
      },
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      contactForCustomColors: true,
      description:
        "Vibrant purple kurta with traditional tile motifs — perfect for festive occasions and photo-ready moments",
      availableStock: 2,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 95,
    },
    {
      id: "sk011",
      type: "kurta",
      category: "royal",
      name: "Floral Charm",
      dhotis: [
        {
          id: "dhoti-gold",
          name: "Gold",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_00_26_PM_olnc6g.webp",
        },
        {
          id: "dhoti-peacock-green",
          name: "Peacock Green",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_10_32_PM_v9upwc.webp",
        },
        {
          id: "dhoti-black",
          name: "Black",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_03_19_PM_vk0hbe.webp",
        },
      ],
      pricing: {
        basePrice: 1199,
        discountPercent: 10,
        fullSetAdditional: 600,
        beadedAdditional: 100,
        tasselsAdditional: 100,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 200,
          L: 400,
          XL: 600,
          XXL: 800,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104205/Floral_Charm_Red_Kurta_o5o4p6.webp",
      options: {
        beaded: {
          images: [],
        },
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104205/Floral_Charm_Red_Kurta_o5o4p6.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104208/IMG_9112_1_ari8xn.webp",
          ],
        },
      },
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      contactForCustomColors: true,
      description:
        "Vibrant purple kurta with traditional tile motifs — perfect for festive occasions and photo-ready moments",
      availableStock: 2,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 95,
    },
    {
      id: "sk012",
      type: "kurta",
      category: "royal",
      name: "Raktangi Kumudini",
      dhotis: [
        {
          id: "dhoti-gold",
          name: "Gold",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_00_26_PM_olnc6g.webp",
        },
        {
          id: "dhoti-peacock-green",
          name: "Peacock Green",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_10_32_PM_v9upwc.webp",
        },
        {
          id: "dhoti-black",
          name: "Black",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_03_19_PM_vk0hbe.webp",
        },
      ],
      pricing: {
        basePrice: 1199,
        discountPercent: 10,
        fullSetAdditional: 600,
        beadedAdditional: 100,
        tasselsAdditional: 100,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 200,
          L: 400,
          XL: 600,
          XXL: 800,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104205/Photoroom_20250616_014856_ztifdg.webp",
      options: {
        beaded: {
          images: [],
        },
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104205/Photoroom_20250616_014856_ztifdg.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750106159/IMG_9110_w18gli.webp",
          ],
        },
      },
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      contactForCustomColors: true,
      description:
        "Vibrant purple kurta with traditional tile motifs — perfect for festive occasions and photo-ready moments",
      availableStock: 2,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 95,
    },
    {
      id: "sk013",
      type: "kurta",
      category: "royal",
      name: "Gaurangi Vasundhara",
      dhotis: [
        {
          id: "dhoti-gold",
          name: "Gold",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562595/ChatGPT_Image_May_18_2025_03_00_26_PM_olnc6g.webp",
        },
        {
          id: "dhoti-peacock-green",
          name: "Peacock Green",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_10_32_PM_v9upwc.webp",
        },
        {
          id: "dhoti-black",
          name: "Black",
          image:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1747562594/ChatGPT_Image_May_18_2025_03_03_19_PM_vk0hbe.webp",
        },
      ],
      pricing: {
        basePrice: 1199,
        discountPercent: 10,
        fullSetAdditional: 600,
        beadedAdditional: 100,
        tasselsAdditional: 100,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 200,
          L: 400,
          XL: 600,
          XXL: 800,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104204/Photoroom_20250615_230414_od0fdt.webp",
      options: {
        beaded: {
          images: [],
        },
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104204/Photoroom_20250615_230414_od0fdt.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1750104204/Photoroom_20250616_015041_cqxpb1.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014055/IMG_2139_mznsnh.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751014055/IMG_2139_mznsnh.webp",
          ],
        },
      },
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      contactForCustomColors: true,
      description:
        "Vibrant purple kurta with traditional tile motifs — perfect for festive occasions and photo-ready moments",
      availableStock: 2,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 95,
    },
  ];
  const uploadProducts = async () => {
    setIsLoading(true);
    setStatus("");

    try {
      const collectionRef = collection(db, "kurtas");

      for (const product of kurtaData) {
        await addDoc(collectionRef, product);
      }

      setStatus("✅ Upload complete!");
    } catch (error) {
      console.error("Upload error:", error);
      setStatus("❌ Upload failed. Check console for error.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">Upload Kurtas to Firestore</h1>
      <p className="text-gray-600 text-center mb-6 max-w-md">
        This will upload all the kurtas in the array to your Firestore
        collection named <strong>"kurtas"</strong>. Document IDs will be
        auto-generated.
      </p>
      <button
        onClick={uploadProducts}
        disabled={isLoading}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
      >
        {isLoading ? "Uploading..." : "Upload Kurtas"}
      </button>
      {status && <p className="mt-6 text-lg font-medium">{status}</p>}
    </div>
  );
};

export default UploadKurtasPage;
