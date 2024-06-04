const asyncHandler = require("express-async-handler");
const Addstock = require('../models/addStockModel')
const xlsx = require('xlsx');

const createAddstock = asyncHandler(async (req, res) => {
    try {
        const addstockData = req.body;

        // Check if addstockData is an array
        if (!Array.isArray(addstockData)) {
            return res.status(400).json({ success: false, code: 400, error: "Request body should be an array" });
        }

        const createdAddstocks = [];

        // Process each entry in the array
        for (const data of addstockData) {
            const { productname, description, inchsize, meterqty, rollqty, palsanafactory, pandesraoffice } = data;

            // Calculate totalmtr
            const totalmtr = meterqty * rollqty;

            // Check if the product already exists in the stock
            let existingAddstock = await Addstock.findOne({
                productname,
                description,
                inchsize,
                meterqty
            });

            if (existingAddstock) {
                // If product exists, update fields
                existingAddstock.rollqty += rollqty;
                existingAddstock.totalmtr += totalmtr;
                await existingAddstock.save();
                createdAddstocks.push(existingAddstock);
            } else {
                // If product doesn't exist, create a new entry
                const addstock = new Addstock({
                    productname,
                    description,
                    inchsize,
                    meterqty,
                    rollqty,
                    totalmtr,
                    palsanafactory,
                    pandesraoffice
                });
                await addstock.save();
                createdAddstocks.push(addstock);
            }
        }

        res.status(201).json({ success: true, code: 201, addstocks: createdAddstocks });
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});

const updateAddstock = asyncHandler(async (req, res) => {
    try {
        const updateDataArray = req.body;

        // Array to store updated stock items
        const updatedStocks = [];

        // Iterate over each update object in the request body
        for (const updateData of updateDataArray) {
            const { id, updateData: newData } = updateData;

            // Update the stock item by ID
            const updatedStock = await Addstock.findByIdAndUpdate(
                id,
                newData,
                { new: true }
            );

            // If the stock item exists and was updated successfully, push it to the array
            if (updatedStock) {
                updatedStocks.push(updatedStock);
            }
        }

        // Success response with updated stock items
        return res.status(200).json({ success: true, code: 200, updatedStocks });
    } catch (error) {
        console.error("Error updating stock:", error);
        return res.status(500).json({ success: false, code: 500, message: "Internal server error" });
    }
});

const addDataFromExcel = asyncHandler(async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }

        // Parse the XLSX file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        // Iterate through each row of data and add or update stock
        for (const rowData of data) {
            // Check if product already exists in the database
            const existingProduct = await Addstock.findOne({
                productname: rowData.productname,
                description: rowData.description,
                inchsize: rowData.inchsize,
                meterqty: rowData.meterqty,
            });

            if (existingProduct) {
                // If product exists, update its rollqty and meterqty
                existingProduct.rollqty += rowData.rollqty;
                existingProduct.totalmtr = existingProduct.rollqty * existingProduct.meterqty;
                await existingProduct.save();
            } else {
                // If product doesn't exist, create a new entry
                const newAddstock = new Addstock({
                    productname: rowData.productname,
                    description: rowData.description,
                    inchsize: rowData.inchsize,
                    meterqty: rowData.meterqty,
                    rollqty: rowData.rollqty,
                    totalmtr: rowData.meterqty * rowData.rollqty,
                    palsanafactory: rowData.palsanafactory,
                    pandesraoffice: rowData.pandesraoffice
                });
                await newAddstock.save();
            }
        }

        res.status(200).send("Stock added successfully.");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error.");
    }
});

const getAddstocks = asyncHandler(async (req, res) => {
    try {
        let stockQuery = {};

        // Check if there are any query parameters
        const queryParams = Object.keys(req.query);

        // If there are query parameters, construct the query based on them
        if (queryParams.length > 0) {
            // Check if there's a query parameter for productname
            if (req.query.productname) {
                // Add productname to the query
                stockQuery.productname = req.query.productname;
            }
            // Check if there's a query parameter for description
            if (req.query.description) {
                // Add description to the query
                // Construct a case-insensitive search query for descriptions containing the provided string
                stockQuery.description = { $regex: req.query.description, $options: 'i' };
            }
            // Check if there's a query parameter for inchsize
            if (req.query.inchsize) {
                // Add inchsize to the query
                stockQuery.inchsize = req.query.inchsize;
            }
            // Check if there's a query parameter for meterqty
            if (req.query.meterqty) {
                // Add meterqty to the query
                stockQuery.meterqty = req.query.meterqty;
            }
        }

        // Add condition for either rollqty or meterqty not being zero

        // Find products based on the constructed query
        const addstocks = await Addstock.find(stockQuery); // Sort by updatedAt in descending order

        res.status(200).json({ success: true, code: 200, addstocks });
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});

const getAvailableAddstocks = asyncHandler(async (req, res) => {
    try {
        const products = req.body || [];

        // If products is not an array, set it to an empty array
        if (!Array.isArray(products)) {
            return res.status(400).json({ success: false, message: "Products should be provided as an array" });
        }

        // If the products array is empty, return a default response
        if (products.length === 0) {
            return res.status(200).json({ success: true, code: 200, response: [] });
        }

        const productQueries = products.map(product => ({
            productname: product.productname,
            inchsize: product.inchsize,
            meterqty: product.meterqty,
            description: product.description
        }));

        const addstocks = await Addstock.aggregate([
            {
                $match: { $or: productQueries }
            },
            {
                $group: {
                    _id: {
                        productname: "$productname",
                        inchsize: "$inchsize",
                        meterqty: "$meterqty",
                        description: "$description"
                    },
                    totalRollQty: { $sum: "$rollqty" }
                }
            }
        ]);

        const addstockMap = new Map();
        addstocks.forEach(addstock => {
            const key = `${addstock._id.productname}-${addstock._id.inchsize}-${addstock._id.meterqty}-${addstock._id.description}`;
            addstockMap.set(key, addstock.totalRollQty);
        });

        const response = products.map(product => {
            const key = `${product.productname}-${product.inchsize}-${product.meterqty}-${product.description}`;
            const totalRollQty = addstockMap.get(key);

            let availableRollQty;
            if (totalRollQty === undefined || totalRollQty === 0) {
                availableRollQty = -1;
            } else if (product.rollqty && product.rollqty > totalRollQty) {
                availableRollQty = totalRollQty;
            } else {
                availableRollQty = 0;
            }

            return { ...product, availability: { productname: product.productname, availableRollQty } };
        });

        res.status(200).json({ success: true, code: 200, response });
    } catch (error) {
        console.error("Error checking product availability:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const getRollwiseAddstocks = asyncHandler(async (req, res) => {
    try {
        let stockQuery = {};

        // Check if there are any query parameters
        const queryParams = Object.keys(req.query);

        // If there are query parameters, construct the query based on them
        if (queryParams.length > 0) {
            // Check if there's a query parameter for productname
            if (req.query.productname) {
                // Add productname to the query
                stockQuery.productname = req.query.productname;
            }
            // Check if there's a query parameter for description
            if (req.query.description) {
                // Add description to the query
                // Construct a case-insensitive search query for descriptions containing the provided string
                stockQuery.description = { $regex: req.query.description, $options: 'i' };
            }
        }

        // Add condition for either rollqty or meterqty not being zero

        // Find products based on the constructed query
        const addstocks = await Addstock.find(stockQuery); // Sort by updatedAt in descending order

        res.status(200).json({ success: true, code: 200, addstocks });
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});

const generateExcelFile = async (palsanafactory, pandesraoffice, productName) => {
    try {
        // Define filter criteria based on query parameters
        const filter = {};
        if (palsanafactory) {
            filter.palsanafactory = true;
        }
        if (pandesraoffice) {
            filter.pandesraoffice = true;
        }
        if (productName) {
            filter.productname = productName;
        }

        // Fetch data from getAddstocks API based on filter criteria
        const addstocks = await Addstock.find(filter).sort({ updatedAt: -1 });

        // Prepare the data for the worksheet
        const jsonData = addstocks.map(stock => ({
            'ProductName': stock.productname,
            'Description': stock.description,
            'InchSize': stock.inchsize,
            'MeterQty': stock.meterqty,
            'RollQty': stock.rollqty,
            'TotalMtr': stock.totalmtr,
            'Location': stock.palsanafactory ? 'Palsana' : 'Pandesra', // Set location based on boolean value
        }));

        // Create a new workbook and add the data
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(jsonData);

        // Set column headers
        ws['!cols'] = [
            { wch: 20 }, // ProductName
            { wch: 30 }, // Description
            { wch: 10 }, // InchSize
            { wch: 10 }, // MeterQty
            { wch: 10 }, // RollQty
            { wch: 15 }, // TotalMtr
            { wch: 20 }, // Location
        ];

        // Add the worksheet to the workbook
        xlsx.utils.book_append_sheet(wb, ws, 'Stock Data');

        // Write the workbook to a buffer
        const excelBuffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        return excelBuffer;
    } catch (error) {
        throw new Error('Failed to generate Excel file');
    }
};

const getInchSizeByProdAndDesc = asyncHandler(async (req, res) => {
    try {
        // Extract the productName and description from the request query
        const { productName, description } = req.query;

        // Check if productName is provided
        if (!productName) {
            return res.status(400).json({ success: false, code: 400, error: "productName is required" });
        }

        // Define the query object
        const query = {
            productname: productName,
        };

        // If description is provided, add it to the query
        if (description) {
            query.description = { $regex: description, $options: 'i' };
        }

        // Find products based on productName and description
        const products = await Addstock.find(query);

        // If no products are found
        if (products.length === 0) {
            return res.status(404).json({ success: false, code: 404, error: "Products not found" });
        }

        // If inchsize is not available for any product
        const inchSizes = products.map(product => product.inchsize);
        if (inchSizes.every(inchSize => inchSize === undefined || inchSize === null)) {
            return res.status(404).json({ success: false, code: 404, error: "Inchsize not available for any product" });
        }

        const meterqty = products.map(product => product.meterqty);
        if (inchSizes.every(meterqty => meterqty === undefined || meterqty === null)) {
            return res.status(404).json({ success: false, code: 404, error: "Meter Qty not available for any product" });
        }

        // Return the inchsizes of the products
        res.status(200).json({ success: true, code: 200, inchsizes: inchSizes, meterqty: meterqty });
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});

const getAllProductNames = asyncHandler(async (req, res) => {
    try {
        // Retrieve all unique product names from the Addstock collection
        const productNames = await Addstock.distinct('productname');

        // If no product names are found
        if (!productNames || productNames.length === 0) {
            return res.status(404).json({ success: false, code: 404, error: "Product names not found" });
        }

        // Return the product names
        res.status(200).json({ success: true, code: 200, productNames: productNames });
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});

const getOutofStocks = asyncHandler(async (req, res) => {
    try {
        let stockQuery = {
            $or: [
                { rollqty: 0 }, // Filter for products where rollqty is equal to zero
                { meterqty: 0 } // Filter for products where meterqty is equal to zero
            ]
        };

        // Check if there are any query parameters
        const queryParams = Object.keys(req.query);

        // If there are query parameters, construct the query based on them
        if (queryParams.length > 0) {
            // Check if there's a query parameter for description
            const { description } = req.query;

            // If description is provided, add it to the query
            if (description) {
                // Construct a case-insensitive search query for descriptions containing the provided string
                stockQuery.description = { $regex: description, $options: 'i' };
            }
        }

        // Find products based on the constructed query
        const addstocks = await Addstock.find(stockQuery);

        res.status(200).json({ success: true, code: 200, addstocks });
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});


const deleteAddstock = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const addstock = await Addstock.findByIdAndDelete(id);
        if (!addstock) {
            return res.status(404).json({ success: false, code: 404, message: "Addstock not found" });
        }
        res.status(200).json({ success: true, code: 200, message: "Addstock deleted successfully" });
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});

const deleteAllAddstock = asyncHandler(async (req, res) => {
    try {
        // Use deleteMany() to clear all data from the Addstock collection
        const deletionResult = await Addstock.deleteMany({});
        if (deletionResult.deletedCount > 0) {
            res.json({ success: true, message: 'All data cleared from Addstock model' });
        } else {
            res.json({ success: true, message: 'No data found in Addstock model' });
        }
    } catch (error) {
        console.error("Error clearing data from Addstock model:", error);
        res.status(500).json({ success: false, error: error.message });
    }
})


module.exports = {
    createAddstock, updateAddstock, addDataFromExcel,
    getAddstocks, getAvailableAddstocks, getRollwiseAddstocks, generateExcelFile, getInchSizeByProdAndDesc,
    getAllProductNames, getOutofStocks, deleteAddstock, deleteAllAddstock
}
