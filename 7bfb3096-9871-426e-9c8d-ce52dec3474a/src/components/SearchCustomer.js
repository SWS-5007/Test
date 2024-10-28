import React, { useState } from "react";
import CustomerList from "./CustomerList";
import List from "../List";

function SearchCustomer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState(List);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term === "") {
      // Show all customers if search term is empty
      setFilteredCustomers(List);
    } else {
      // Filter customers based on the search term (case-sensitive)
      const filtered = List.filter((customer) =>
        Object.values(customer).some((value) =>
          value.toString().toLowerCase().startsWith(term.toLowerCase())
        )
      );
      setFilteredCustomers(filtered);
    }
  };

  return (
    <>
      <div className="layout-row align-items-center justify-content-center mt-30">
        <input
          className="large mx-20 w-20"
          data-testid="search-input"
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Enter search term (Eg: Phil)"
        />
      </div>
      <CustomerList customers={filteredCustomers} />
    </>
  );
}

export default SearchCustomer;
