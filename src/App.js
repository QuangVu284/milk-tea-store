import React, { useState, useEffect } from "react";
import "./App.css";

const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const App = () => {
  const [products, setProducts] = useState([]);
  const [storeProducts, setStoreProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortOption, setSortOption] = useState("nameAsc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedToppings, setSelectedToppings] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const productsData = await fetchData("/data/products.json");
        const storeProductsData = await fetchData("/data/storeProducts.json");
        const storesData = await fetchData("/data/stores.json");

        setProducts(productsData.products);
        setStoreProducts(storeProductsData.shopProducts);
        setStores(storesData.stores);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      const storeProductIds = storeProducts
        .filter((sp) => sp.shop === selectedStore.id)
        .map((sp) => sp.product);

      const storeProductsDetails = products.filter((product) =>
        storeProductIds.includes(product.id)
      );

      const filterByToppings =
        selectedToppings.length > 0
          ? storeProductsDetails.filter((product) =>
              selectedToppings.some((topping) =>
                product.toppings.toLowerCase().includes(topping.toLowerCase())
              )
            )
          : storeProductsDetails;

      setFilteredProducts(filterByToppings);
    } else {
      setFilteredProducts([]);
    }
  }, [selectedStore, products, storeProducts, selectedToppings]);

  const handleSortChange = (event) => {
    const option = event.target.value;
    setSortOption(option);

    const sortedProducts = [...filteredProducts];
    if (option === "nameAsc") {
      sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (option === "nameDesc") {
      sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
    } else if (option === "priceAsc") {
      sortedProducts.sort((a, b) => a.price - b.price);
    } else if (option === "priceDesc") {
      sortedProducts.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(sortedProducts);
  };

  const handleToppingChange = (topping) => {
    setSelectedToppings((prev) =>
      prev.includes(topping)
        ? prev.filter((item) => item !== topping)
        : [...prev, topping]
    );
  };

  return (
    <div className="container">
      <div className="sidebar">
        <h3>Milk Tea Store</h3>
        <ul>
          {stores.map((store) => (
            <li
              key={store.id}
              className={selectedStore?.id === store.id ? "selected" : ""}
              onClick={() => setSelectedStore(store)}
            >
              {store.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="content">
        <h1>
          {selectedStore
            ? selectedStore.name + " Menu"
            : "Select a store to view its menu"}
        </h1>
        <div className="fillter-sortBy">
          <button onClick={() => setIsFilterOpen(!isFilterOpen)}>Filter</button>
          <div className="sortByText">
            Sort By
            <select onChange={handleSortChange} value={sortOption}>
              <option value="nameAsc">Name (A-Z)</option>
              <option value="nameDesc">Name (Z-A)</option>
              <option value="priceAsc">Price (Low to High)</option>
              <option value="priceDesc">Price (High to Low)</option>
            </select>
          </div>
        </div>
        {isFilterOpen && (
          <div className="filter-options">
            <label>Toppings : </label>
            <div className="topping-list">
              {[
                "Milk foam",
                "White pearl",
                "Pearl",
                "Aloe",
                "Black sugar",
                "Fresh milk",
              ].map((topping) => (
                <div className="topping-item" key={topping}>
                  <input
                    type="checkbox"
                    value={topping.trim()}
                    onChange={() => handleToppingChange(topping.trim())}
                    checked={selectedToppings.includes(topping.trim())}
                  />
                  <label>{topping.trim()}</label>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="product-list">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="product-item">
                <h4>{product.name}</h4>
                <div className="separator"></div>
                <h4>Toppings: </h4>
                <p>{product.toppings}</p>
                <span>${product.price}</span>
              </div>
            ))
          ) : (
            <p className="no-products">There are no products</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
