import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const UploadKurtasPage = () => {
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const kurtaData = [
    {
      id: "fs-frock-001",
      type: "frock",
      category: "classic",
      name: "Monochrome Charm with little bows",
      pricing: {
        basePrice: 799,
        discountPercent: 6,
        fullSetAdditional: 500,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 100,
          L: 300,
          XL: 500,
          XXL: 700,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1746702948/bow-frock-2_o8dwec.webp",
      options: {
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751108611/Monochrome_Charm_with_little_black_bows._pbyots.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751108610/Monochrome_Charm_with_little_black_bows_dyrivt.webp",
          ],
        },
        beaded: {
          images: [],
        },
      },
      sizes: ["XS", "S", "M", "L"],
      contactForCustomColors: false,
      description:
        "Chic black and white frock with soft layered frills and elegant black bows. Perfect for celebrations, photoshoots, and classy outings.",
      availableStock: 10,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 85,
    },
    {
      id: "fs-frock-002",
      type: "frock",
      category: "classic",
      name: "Sky Blue Polka Dot Frock",
      pricing: {
        basePrice: 899,
        discountPercent: 6,
        fullSetAdditional: 500,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 100,
          L: 300,
          XL: 500,
          XXL: 700,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1746702948/blue-frock_lhb0ge.webp",
      options: {
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1746702948/blue-frock_lhb0ge.webp",
          ],
        },
        beaded: {
          images: [],
        },
      },
      sizes: ["XS", "S", "M", "L"],
      contactForCustomColors: false,
      description:
        "Make your pet the center of attention with this adorable frock crafted in soft blue fabric adorned with timeless white polka dots. Designed with layered frills and finished with a crisp white satin bow at the back, it’s the perfect outfit for celebrations, photo sessions, or a stylish stroll. Comfort meets cuteness in this picture-perfect ensemble for your furry princess.",
      availableStock: 10,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 85,
    },
    {
      id: "fs-frock-003",
      type: "frock",
      category: "classic",
      name: "Floral Fairy Pink Cotton Frock",
      pricing: {
        basePrice: 899,
        discountPercent: 6,
        fullSetAdditional: 500,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 100,
          L: 300,
          XL: 500,
          XXL: 700,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1746702948/FROCK_1_kjkkw4.webp",
      options: {
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1746702948/FROCK_1_kjkkw4.webp",
          ],
        },
        beaded: {
          images: [],
        },
      },
      sizes: ["XS", "S", "M", "L"],
      contactForCustomColors: false,
      description:
        "Brighten up your pet’s day with our Pink Blossom Smocked Frock, featuring a playful floral print in vibrant yellow, magenta, and white. Designed with comfy smocking at the top and soft shoulder straps, this breezy dress is perfect for sunny day outings, garden parties, and cuddly photo moments. The flared ruffle hem adds that extra bounce to every step!",
      availableStock: 10,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 85,
    },
    {
      id: "fs-frock-004",
      type: "frock",
      category: "classic",
      name: " White Whisper With Bow",
      pricing: {
        basePrice: 699,
        discountPercent: 10,
        fullSetAdditional: 500,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 100,
          L: 300,
          XL: 500,
          XXL: 700,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1746702948/IMG_9666_1_j33uu0.webp",
      options: {
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751108610/White_Whisper_with_Bow_dce8nr.webp",
          ],
        },
        beaded: {
          images: [],
        },
      },
      sizes: ["XS", "S", "M", "L"],
      contactForCustomColors: false,
      description:
        "Let your furry diva shine in our Snow Belle Frock, a dreamy white dress featuring a soft mesh overlay and a bold scarlet satin bow that makes a statement from every angle. Tied together with a matching red hair bow, this outfit is perfect for birthdays, festive occasions, or Valentine photo shoots. Elegant, adorable, and full of charm—just like your pet!",
      availableStock: 10,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 85,
    },
    {
      id: "fs-frock-005",
      type: "frock",
      category: "classic",
      name: " PikaPup Princess Dress",
      pricing: {
        basePrice: 699,
        discountPercent: 10,
        fullSetAdditional: 500,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 100,
          L: 300,
          XL: 500,
          XXL: 700,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1748244566/IMG_9122_snwsir.webp",
      colors: [
        {
          id: "Yellow",
          name: "Yellow",
          colorCode: "#EFCA42", // For color swatch display
          options: {
            nonBeaded: {
              images: [
                "https://res.cloudinary.com/di6unrpjw/image/upload/v1748244566/IMG_9122_snwsir.webp",
              ],
            },
            beaded: {
              images: [],
            },
          },
        },
        {
          id: "White",
          name: "White",
          colorCode: "#fff",
          options: {
            nonBeaded: {
              images: [
                "https://res.cloudinary.com/di6unrpjw/image/upload/v1748244566/IMG_9120_spgjgu.webp",
              ],
            },
            beaded: {
              images: [],
            },
          },
        },
      ],
      options: {
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1748244566/IMG_9122_snwsir.webp ",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1748244566/IMG_9120_spgjgu.webp",
          ],
        },
        beaded: {
          images: [],
        },
      },
      sizes: ["XS", "S", "M", "L"],
      contactForCustomColors: false,
      description:
        "It's playful, cute, and clearly inspired by Pikachu's iconic face, while also highlighting that it's a charming outfit for a little pup princess.",
      availableStock: 10,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 85,
    },
    {
      id: "fs-frock-006",
      type: "frock",
      category: "classic",
      name: " Angel Paws Pink Frock",
      pricing: {
        basePrice: 699,
        discountPercent: 10,
        fullSetAdditional: 500,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 100,
          L: 300,
          XL: 500,
          XXL: 700,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1748244566/ChatGPT_Image_May_14_2025_01_22_44_AM_wtrzdi.webp",
      colors: [
        {
          id: "blush-pink",
          name: "Blush Pink",
          colorCode: "#F8BBD9", // For color swatch display
          options: {
            nonBeaded: {
              images: [
                "https://res.cloudinary.com/di6unrpjw/image/upload/v1748244566/ChatGPT_Image_May_14_2025_01_22_44_AM_wtrzdi.webp",
              ],
            },
            beaded: {
              images: [],
            },
          },
        },
        {
          id: "sky-blue",
          name: "Sky Blue",
          colorCode: "#87CEEB",
          options: {
            nonBeaded: {
              images: [
                "https://res.cloudinary.com/di6unrpjw/image/upload/v1748244566/ChatGPT_Image_May_14_2025_01_26_02_AM_tnyowy.webp",
              ],
            },
            beaded: {
              images: [],
            },
          },
        },
      ],
      options: {
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1748244566/ChatGPT_Image_May_14_2025_01_22_44_AM_wtrzdi.webp",
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1748244566/ChatGPT_Image_May_14_2025_01_26_02_AM_tnyowy.webp",
          ],
        },
        beaded: {
          images: [],
        },
      },
      sizes: ["XS", "S", "M", "L"],
      contactForCustomColors: false,
      description:
        "This blush-pink dress features soft wings, a tulle skirt, and pom-pom trim—perfect for photos, playdates, or fancy strolls.",
      availableStock: 10,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 85,
    },
    {
      id: "fs-frock-007",
      type: "frock",
      category: "classic",
      name: "Cherry Red Polka Dot",
      pricing: {
        basePrice: 699,
        discountPercent: 10,
        fullSetAdditional: 500,
        sizeIncrements: {
          XS: 0,
          S: 0,
          M: 100,
          L: 300,
          XL: 500,
          XXL: 700,
        },
      },
      defaultOptions: {
        isBeaded: false,
        isFullSet: false,
        size: "S",
      },
      mainImage:
        "https://res.cloudinary.com/di6unrpjw/image/upload/v1751108610/cherry_red_polka_dot_frock_d3cspz.webp",
      options: {
        nonBeaded: {
          images: [
            "https://res.cloudinary.com/di6unrpjw/image/upload/v1751108610/cherry_red_polka_dot_frock_d3cspz.webp",
          ],
        },
        beaded: {
          images: [],
        },
      },
      sizes: ["XS", "S", "M", "L"],
      contactForCustomColors: false,
      description:
        "Let your little fur angel flutter in style with the Angel Paws Tutu! This dreamy blush-pink dress features soft wing details on the back and a delicate tulle skirt trimmed with playful pom-poms. Perfect for photoshoots, playdates, or pampered strolls, this dress brings out the heavenly charm in every pup.",
      availableStock: 10,
      isBeadedAvailable: false,
      isNonBeadedAvailable: true,
      priorityScore: 85,
    },
  ];
  const uploadProducts = async () => {
    setIsLoading(true);
    setStatus("");

    try {
      const collectionRef = collection(db, "frocks");

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
      <h1 className="text-2xl font-bold mb-4">Upload frocks to Firestore</h1>
      <p className="text-gray-600 text-center mb-6 max-w-md">
        This will upload all the frocks in the array to your Firestore
        collection named <strong>frocks</strong>. Document IDs will be
        auto-generated.
      </p>
      <button
        onClick={uploadProducts}
        disabled={isLoading}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
      >
        {isLoading ? "Uploading..." : "Upload frocks"}
      </button>
      {status && <p className="mt-6 text-lg font-medium">{status}</p>}
    </div>
  );
};

export default UploadKurtasPage;
