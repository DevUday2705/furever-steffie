import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase";




export const getTopProductsByGender = async (gender) => {
  const collectionMap = {
    male: ['kurtas', 'pathanis'],
    female: ['female-bandanas', 'frocks', 'tuts'],
  };

  const categories = gender === "male" ? collectionMap.male : collectionMap.female;
  const topProducts = [];

  for (const category of categories) {
    let q;

    if (gender === "male") {
      // Fetch more documents and filter client-side
      q = query(
        collection(db, category),
        orderBy("priorityScore", "desc"),
        limit(20) // Fetch more to account for filtering
      );

      const snapshot = await getDocs(q);
      const products = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          category,
        }))
        .filter(product => product.isRoyal === true) // Filter for royal products
        .slice(0, 4); // Take only top 4

      topProducts.push(...products);
    } else {
      // For female products, keep original query
      q = query(
        collection(db, category),
        orderBy("priorityScore", "desc"),
        limit(4)
      );

      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        category,
      }));
      topProducts.push(...products);
    }
  }

  return topProducts;
};

export const bowData = {
  requiresMeasurements: false,
  category: "Bows",
  subcategories: [
    {
      id: "male-bows",
      name: "Bows",
      products: [
        {
          category: "male-bow",
          id: "mb001",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913539/Fluffy_Joy_with_Elephants_Bow_Tie_vxcbtm_hmyqmk.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "male-bow",
          id: "mb002",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913539/Fluffy_Joy_with_Elephants_Bow_Tie_vxcbtm_hmyqmk.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "male-bow",
          id: "mb003",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913516/Adorable_Shih_Tzu_with_Bow_Tie_szepeo_xe85qr.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "male-bow",
          id: "mb004",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913512/ChatGPT_Image_Apr_17_2025_12_02_38_AM_bnjtxw_fafcn8.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "male-bow",
          id: "mb005",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913511/Fluffy_Pup_with_a_Stylish_Bow_Tie_u0dwbf_yegmxs.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "male-bow",
          id: "mb006",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913511/Fluffy_Elegance_in_Blue_Polka_Dot_yoi6r6_bupeuu.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "male-bow",
          id: "mb007",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913510/Fluffy_Dog_with_Elephant_Bow_Tie_rdwjpd_fczksv.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "male-bow",
          id: "mb008",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913510/ChatGPT_Image_Apr_17_2025_12_11_53_AM_fklx3f_f8omgt.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "male-bow",
          id: "mb008",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913508/Fluffy_Shih_Tzu_with_Bow_Tie_glcg9k_ckl4sx.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "male-bow",
          id: "mb009",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913507/Fluffy_Shih_Tzu_in_Bow_Tie_wbwvlc_jpxp26.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "male-bow",
          id: "mb010",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913505/Joyful_Shih_Tzu_with_Bow_Tie_hruwlp_ihizad.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "male-bow",
          id: "mb011",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913504/Fluffy_Shih_Tzu_in_Bow_Tie_1_le97id_xlop2i.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "male-bow",
          id: "mb012",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913502/ChatGPT_Image_Apr_16_2025_11_54_35_PM_vqzuo9_tyaj6j.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "male-bow",
          id: "mb013",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913502/ChatGPT_Image_Apr_16_2025_11_51_23_PM_mggtv4_kkmpna.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "male-bow",
          id: "mb014",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913500/ChatGPT_Image_Apr_17_2025_12_20_28_AM_ijs5hw_ma9ugd.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "male-bow",
          id: "mb015",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913500/ChatGPT_Image_Apr_17_2025_12_30_37_AM_rl5k84_rdh4dw.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
      ],
    },
    {
      id: "female-bow",
      name: "Bows",
      products: [
        {
          category: "female-bow",
          id: "fb001",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913360/ChatGPT_Image_Apr_17_2025_01_10_42_AM_ludkga.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "female-bow",
          id: "fb002",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913360/ChatGPT_Image_Apr_17_2025_01_06_54_AM_cdpiof.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "female-bow",
          id: "fb003",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913360/ChatGPT_Image_Apr_17_2025_01_00_56_AM_kfwhws.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "female-bow",
          id: "fb004",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913361/ChatGPT_Image_Apr_17_2025_01_02_11_AM_sp7jye.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "female-bow",
          id: "fb005",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913361/ChatGPT_Image_Apr_17_2025_01_03_20_AM_iiqxyb.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "female-bow",
          id: "fb006",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913361/ChatGPT_Image_Apr_17_2025_12_57_09_AM_qgahgw.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "female-bow",
          id: "fb007",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913361/ChatGPT_Image_Apr_17_2025_12_59_44_AM_uijz1m.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "female-bow",
          id: "fb008",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913362/ChatGPT_Image_Apr_17_2025_01_05_21_AM_ikyodz.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "female-bow",
          id: "fb009",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913362/ChatGPT_Image_Apr_17_2025_12_42_40_AM_dw2xx6.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
        {
          category: "female-bow",
          id: "fb010",
          name: "Royal Blue Solid Kurta",
          pricing: {
            basePrice: 199,
            fullSetAdditional: 200,
            //"beadedAdditional": 100,
            "tasselsAdditional": 100,
            sizeIncrements: {
              XS: 0,
              S: 0,
              M: 20,
              L: 40,
              XL: 60,
              XXL: 80,
            },
          },
          defaultOptions: {
            isFullSet: false,
            size: "S",
          },
          mainImage:
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1744913363/Apr_17_2025_12_54_14_AM_aet4jv.png",
          sizes: ["S", "M", "L"],
          contactForCustomColors: true,
          description:
            "A beautiful royal blue solid kurta for your pet, perfect for special occasions and festivals.",
        },
      ],
    },
  ],
  pricingCalculator: {
    calculateFinalPrice:
      "function(product, options) { let finalPrice = product.pricing.basePrice; if (options.isFullSet) { finalPrice += product.pricing.fullSetAdditional; } if (options.isBeaded) { finalPrice += product.pricing.beadedAdditional; } finalPrice += product.pricing.sizeIncrements[options.size]; return finalPrice; }",
  },
};



export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export const traditionalOptions = [
  {
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
          { size: "XL", inStock: true, price: "1049" },
        ],
      },
    ],
  },
];

// Validate form
export const validateForm = (formData, setErrors) => {
  const newErrors = {};

  if (!formData.fullName.trim()) {
    newErrors.fullName = "Full name is required";
  }

  if (!formData.email.trim()) {
    newErrors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = "Enter a valid email address";
  }

  if (!formData.addressLine1.trim()) {
    newErrors.addressLine1 = "Address is required";
  }

  if (!formData.city.trim()) {
    newErrors.city = "City is required";
  }

  // Only require state for India
  if (formData.country === "india" && !formData.state.trim()) {
    newErrors.state = "State is required";
  }

  // Validate pincode/postal code based on country
  if (formData.country === "india") {
    if (!formData.pincode.trim()) {
      newErrors.pincode = "PIN code is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Enter a valid 6-digit PIN code";
    }
  } else {
    // For international addresses, postal code is optional but if provided should be reasonable
    if (formData.pincode.trim() && formData.pincode.trim().length < 3) {
      newErrors.pincode = "Enter a valid postal code";
    }
  }

  if (!formData.mobileNumber.trim()) {
    newErrors.mobileNumber = "Mobile number is required";
  } else {
    // More flexible mobile number validation for international numbers
    const cleanNumber = formData.mobileNumber.replace(/[\s\-()+ ]/g, '');
    if (formData.country === "india") {
      if (!/^\d{10}$/.test(cleanNumber)) {
        newErrors.mobileNumber = "Enter a valid 10-digit mobile number";
      }
    } else {
      // International numbers can be 7-15 digits
      if (!/^\d{7,15}$/.test(cleanNumber)) {
        newErrors.mobileNumber = "Enter a valid mobile number (7-15 digits)";
      }
    }
  }

  if (!formData.country.trim()) {
    newErrors.country = "Country is required";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


export function formatStatus(text) {
  return text
    .split('-')                     // Split by hyphens
    .map(word =>                    // Capitalize each word
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(' ');                     // Join back with spaces
}