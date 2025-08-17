// File: src/pages/admin/ProductForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const defaultSchema = {
  name: "",
  description: "",
  mainImage: "",
  availableStock: 0,
  priorityScore: 0,
  contactForCustomColors: false,
  category: "royal",
  type: "kurta",
  isBeadedAvailable: false,
  isNonBeadedAvailable: true,
  isRoyal: false, // Add this line
  sizeStock: {
    XS: 5,
    S: 5,
    M: 5,
  },
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  dhotis: [],
  pricing: {
    basePrice: 0,
    discountPercent: 0,
    fullSetAdditional: 0,
    beadedAdditional: 0,
    tasselsAdditional: 0,
    sizeIncrements: {
      XS: 0,
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      XXL: 0,
    },
  },
  defaultOptions: {
    isBeaded: false,
    isFullSet: false,
    size: "S",
  },
  options: {
    beaded: { images: [] },
    nonBeaded: { images: [] },
  },
};
// Schema configurations for different categories
const schemaConfigurations = {
  kurta: {
    additionalFields: [],
    excludedFields: [],
  },
  frock: {
    additionalFields: ["colors"],
    excludedFields: [],
    fieldDefaults: {
      colors: [],
    },
  },
  tut: {
    additionalFields: ["colors"],
    excludedFields: [],
    fieldDefaults: {
      colors: [],
    },
  },
  // Add more categories as needed
  tuxedo: {
    additionalFields: ["colors"],
    excludedFields: ["dhotis"],
    fieldDefaults: {
      colors: [],
    },
  },
};

// Default item structures for array fields
const defaultArrayItems = {
  colors: {
    colorCode: "",
    id: "",
    name: "",
    options: {
      nonBeaded: {
        images: [],
      },
    },
  },
  dhotis: {
    name: "",
    id: "",
    image: "",
  },
};
const generateSchemaForCategory = (category) => {
  const config = schemaConfigurations[category];
  if (!config) return defaultSchema;

  let schema = { ...defaultSchema };

  // Add additional fields with their defaults
  config.additionalFields?.forEach((field) => {
    if (config.fieldDefaults?.[field] !== undefined) {
      schema[field] = config.fieldDefaults[field];
    }
  });

  // Remove excluded fields
  config.excludedFields?.forEach((field) => {
    delete schema[field];
  });

  return schema;
};

const ProductForm = () => {
  const { category, id } = useParams();

  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState(() =>
    generateSchemaForCategory(category)
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (isEditMode) {
        try {
          const docRef = doc(db, `${category}s`, id);
          const snap = await getDoc(docRef);

          if (snap.exists()) {
            const data = snap.data();
            console.log("Fetched data:", data);

            // Create a deep copy of defaultSchema
            const merged = JSON.parse(
              JSON.stringify(generateSchemaForCategory(category))
            );
            const deepMerge = (target, source) => {
              for (const key in source) {
                if (source[key] !== null && source[key] !== undefined) {
                  if (
                    typeof source[key] === "object" &&
                    !Array.isArray(source[key])
                  ) {
                    if (!target[key] || typeof target[key] !== "object") {
                      target[key] = {};
                    }
                    deepMerge(target[key], source[key]);
                  } else {
                    target[key] = source[key];
                  }
                }
              }
              return target;
            };

            const finalData = deepMerge(merged, data);
            console.log("Final merged data:", finalData);
            setFormData(finalData);
          } else {
            console.log("No document found!");
            setError("Product not found");
          }
        } catch (err) {
          console.error("Error fetching product:", err);
          setError("Failed to fetch product data");
        }
      } else {
        // For new products, set the category from URL params
        setFormData((prev) => ({ ...prev, category, type: category }));
      }
      setIsLoading(false);
    };
    fetchData();
  }, [category, id, isEditMode]);

  const handleChange = (path, value) => {
    const keys = path.split(".");
    setFormData((prev) => {
      const copy = { ...prev };
      let nested = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!nested[keys[i]]) nested[keys[i]] = {};
        nested[keys[i]] = { ...nested[keys[i]] };
        nested = nested[keys[i]];
      }
      nested[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  const handleArrayChange = (path, index, key, value) => {
    setFormData((prev) => {
      const copy = { ...prev };
      const keys = path.split(".");
      let nested = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        nested[keys[i]] = { ...nested[keys[i]] };
        nested = nested[keys[i]];
      }
      const arrayRef = nested[keys[keys.length - 1]];
      if (arrayRef && arrayRef[index]) {
        arrayRef[index] = { ...arrayRef[index] };
        arrayRef[index][key] = value;
      }
      return copy;
    });
  };

  const addToArray = (path, defaultObj) => {
    const currentArray = path.split(".").reduce((obj, k) => obj[k], formData);
    handleChange(path, [...currentArray, defaultObj]);
  };

  const removeFromArray = (path, index) => {
    const currentArray = path.split(".").reduce((obj, k) => obj[k], formData);
    const newArray = currentArray.filter((_, i) => i !== index);
    handleChange(path, newArray);
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      const dataToSave = {
        ...formData,
        type: category,
        category: category,
      };

      if (isEditMode) {
        await setDoc(doc(db, `${category}s`, id), dataToSave);
        console.log("Product updated successfully");
      } else {
        const docRef = await addDoc(collection(db, `${category}s`), dataToSave);
        console.log("Product added successfully with ID:", docRef.id);
      }
      navigate("/admin/product");
    } catch (err) {
      console.error("Error saving product:", err);
      setError("Failed to save product");
    }
  };

  if (isLoading) return <div className="p-6 max-w-4xl mx-auto">Loading...</div>;

  if (error)
    return (
      <div className="p-6 max-w-4xl mx-auto text-red-600">Error: {error}</div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">
        {isEditMode ? "Edit" : "Add New"} {category} -{" "}
        {isEditMode ? formData.name : "New Product"}
      </h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            type="text"
            placeholder="Product Name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full border px-4 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full border px-4 py-2 rounded h-20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Main Image URL
          </label>
          <input
            type="text"
            placeholder="Main Image URL"
            value={formData.mainImage}
            onChange={(e) => handleChange("mainImage", e.target.value)}
            className="w-full border px-4 py-2 rounded"
          />
          {formData.mainImage && (
            <img
              src={formData.mainImage}
              alt="Preview"
              className="mt-2 w-32 h-32 object-cover rounded"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Available Stock
            </label>
            <input
              type="number"
              placeholder="Available Stock"
              value={formData.availableStock}
              onChange={(e) =>
                handleChange("availableStock", Number(e.target.value))
              }
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Priority Score
            </label>
            <input
              type="number"
              placeholder="Priority Score"
              value={formData.priorityScore}
              onChange={(e) =>
                handleChange("priorityScore", Number(e.target.value))
              }
              className="w-full border px-4 py-2 rounded"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.contactForCustomColors}
              onChange={(e) =>
                handleChange("contactForCustomColors", e.target.checked)
              }
            />
            <span>Contact For Custom Colors</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isBeadedAvailable}
              onChange={(e) =>
                handleChange("isBeadedAvailable", e.target.checked)
              }
            />
            <span>Beaded Option Available</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isNonBeadedAvailable}
              onChange={(e) =>
                handleChange("isNonBeadedAvailable", e.target.checked)
              }
            />
            <span>Non-Beaded Option Available</span>
          </label>
        </div>
        {category === "kurta" && (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isRoyal}
              onChange={(e) => handleChange("isRoyal", e.target.checked)}
            />
            <span>Is Royal</span>
          </label>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full border px-4 py-2 rounded"
          />
        </div>

        {/* Pricing Section */}
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Base Price
              </label>
              <input
                type="number"
                placeholder="Base Price"
                value={formData.pricing.basePrice}
                onChange={(e) =>
                  handleChange("pricing.basePrice", Number(e.target.value))
                }
                className="w-full border px-3 py-1 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Discount Percent
              </label>
              <input
                type="number"
                placeholder="Discount Percent"
                value={formData.pricing.discountPercent}
                onChange={(e) =>
                  handleChange(
                    "pricing.discountPercent",
                    Number(e.target.value)
                  )
                }
                className="w-full border px-3 py-1 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Set Additional
              </label>
              <input
                type="number"
                placeholder="Full Set Additional"
                value={formData.pricing.fullSetAdditional}
                onChange={(e) =>
                  handleChange(
                    "pricing.fullSetAdditional",
                    Number(e.target.value)
                  )
                }
                className="w-full border px-3 py-1 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Beaded Additional
              </label>
              <input
                type="number"
                placeholder="Beaded Additional"
                value={formData.pricing.beadedAdditional}
                onChange={(e) =>
                  handleChange(
                    "pricing.beadedAdditional",
                    Number(e.target.value)
                  )
                }
                className="w-full border px-3 py-1 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Tassels Additional
              </label>
              <input
                type="number"
                placeholder="Tassels Additional"
                value={formData.pricing.tasselsAdditional}
                onChange={(e) =>
                  handleChange(
                    "pricing.tasselsAdditional",
                    Number(e.target.value)
                  )
                }
                className="w-full border px-3 py-1 rounded"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Size Increments
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(formData.pricing.sizeIncrements).map(
                ([size, price]) => (
                  <div key={size}>
                    <label className="block text-xs font-medium mb-1">
                      {size}
                    </label>
                    <input
                      type="number"
                      placeholder={size}
                      value={price}
                      onChange={(e) =>
                        handleChange(
                          `pricing.sizeIncrements.${size}`,
                          Number(e.target.value)
                        )
                      }
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Beaded / Non-Beaded Images */}
        {["beaded", "nonBeaded"].map((style) => (
          <div key={style} className="border p-4 rounded">
            <h2 className="font-semibold mb-2 capitalize">{style} Images</h2>
            {formData.options[style].images.map((url, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={url}
                  placeholder="Image URL"
                  onChange={(e) => {
                    const newImages = [...formData.options[style].images];
                    newImages[idx] = e.target.value;
                    handleChange(`options.${style}.images`, newImages);
                  }}
                  className="flex-1 border px-3 py-1 rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newImages = formData.options[style].images.filter(
                      (_, i) => i !== idx
                    );
                    handleChange(`options.${style}.images`, newImages);
                  }}
                  className="text-red-600 px-2 py-1 border border-red-300 rounded text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                handleChange(`options.${style}.images`, [
                  ...formData.options[style].images,
                  "",
                ])
              }
              className="text-sm text-blue-600 border border-blue-300 px-3 py-1 rounded"
            >
              + Add Image
            </button>
          </div>
        ))}

        {!schemaConfigurations[category]?.excludedFields?.includes(
          "dhotis"
        ) && (
          <div className="border p-4 rounded">
            <h2 className="font-semibold mb-2">Dhotis</h2>
            {formData.dhotis.map((dhoti, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={dhoti.name || ""}
                  onChange={(e) =>
                    handleArrayChange("dhotis", idx, "name", e.target.value)
                  }
                  className="border px-2 py-1 rounded"
                />
                <input
                  type="text"
                  placeholder="ID"
                  value={dhoti.id || ""}
                  onChange={(e) =>
                    handleArrayChange("dhotis", idx, "id", e.target.value)
                  }
                  className="border px-2 py-1 rounded"
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  value={dhoti.image || ""}
                  onChange={(e) =>
                    handleArrayChange("dhotis", idx, "image", e.target.value)
                  }
                  className="border px-2 py-1 rounded"
                />
                <button
                  type="button"
                  onClick={() => removeFromArray("dhotis", idx)}
                  className="text-red-600 px-2 py-1 border border-red-300 rounded text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                addToArray("dhotis", { name: "", id: "", image: "" })
              }
              className="text-sm text-blue-600 border border-blue-300 px-3 py-1 rounded"
            >
              + Add Dhoti
            </button>
          </div>
        )}
        {/* Dhotis Section */}

        {schemaConfigurations[category]?.additionalFields?.includes(
          "colors"
        ) && (
          <div className="border p-4 rounded">
            <h2 className="font-semibold mb-2">Colors</h2>
            {formData.colors?.map((color, idx) => (
              <div key={idx} className="border p-3 mb-3 rounded bg-gray-50">
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Color Name"
                    value={color.name || ""}
                    onChange={(e) =>
                      handleArrayChange("colors", idx, "name", e.target.value)
                    }
                    className="border px-2 py-1 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Color Code"
                    value={color.colorCode || ""}
                    onChange={(e) =>
                      handleArrayChange(
                        "colors",
                        idx,
                        "colorCode",
                        e.target.value
                      )
                    }
                    className="border px-2 py-1 rounded"
                  />
                  <input
                    type="text"
                    placeholder="ID"
                    value={color.id || ""}
                    onChange={(e) =>
                      handleArrayChange("colors", idx, "id", e.target.value)
                    }
                    className="border px-2 py-1 rounded"
                  />
                </div>

                <div className="mt-2">
                  <label className="block text-xs font-medium mb-1">
                    Non-Beaded Images
                  </label>
                  {color.options?.nonBeaded?.images?.map(
                    (imageUrl, imageIdx) => (
                      <div key={imageIdx} className="flex gap-2 mb-1">
                        <input
                          type="text"
                          value={imageUrl}
                          placeholder="Image URL"
                          onChange={(e) => {
                            const newImages = [
                              ...(color.options?.nonBeaded?.images || []),
                            ];
                            newImages[imageIdx] = e.target.value;
                            handleArrayChange("colors", idx, "options", {
                              ...color.options,
                              nonBeaded: {
                                ...color.options?.nonBeaded,
                                images: newImages,
                              },
                            });
                          }}
                          className="flex-1 border px-2 py-1 rounded text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = (
                              color.options?.nonBeaded?.images || []
                            ).filter((_, i) => i !== imageIdx);
                            handleArrayChange("colors", idx, "options", {
                              ...color.options,
                              nonBeaded: {
                                ...color.options?.nonBeaded,
                                images: newImages,
                              },
                            });
                          }}
                          className="text-red-600 px-2 py-1 border border-red-300 rounded text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    )
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const currentImages =
                        color.options?.nonBeaded?.images || [];
                      handleArrayChange("colors", idx, "options", {
                        ...color.options,
                        nonBeaded: {
                          ...color.options?.nonBeaded,
                          images: [...currentImages, ""],
                        },
                      });
                    }}
                    className="text-xs text-blue-600 border border-blue-300 px-2 py-1 rounded"
                  >
                    + Add Image
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromArray("colors", idx)}
                  className="text-red-600 px-2 py-1 border border-red-300 rounded text-sm mt-2"
                >
                  Remove Color
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addToArray("colors", defaultArrayItems.colors)}
              className="text-sm text-blue-600 border border-blue-300 px-3 py-1 rounded"
            >
              + Add Color
            </button>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            {isEditMode ? "Update" : "Add"} Product
          </button>
          <button
            onClick={() => navigate("/admin")}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
