const asyncHandler = require("express-async-handler");
const SalesOrder = require('../models/salesOrderModel')
const Addstock = require('../models/addStockModel');
// const Oldstock = require("../models/oldStockModel");
const Qrdata = require("../models/qrdataModel")


const createSalesOrder = asyncHandler(async (req, res) => {
    try {
        const {
            challandate,
            challannumber,
            salesdate,
            customername,
            ordernumber,
            salesperson,
            products, // Assuming this is an array of products
            dispatch,
            customernotes,
            totalroll,
            totalmeter
        } = req.body;

        const salesOrder = new SalesOrder({
            challandate,
            challannumber,
            salesdate,
            customername,
            ordernumber,
            salesperson,
            products, // Assuming this is an array of products
            dispatch,
            customernotes,
            totalroll,
            totalmeter
        });

        await salesOrder.save();
        res.status(201).json({ success: true, code: 201, salesOrder });
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});


const getSalesOrders = asyncHandler(async (req, res) => {
    try {
        let query = {};

        // Check if there's a query parameter for status
        const { status } = req.query;

        // If status is provided, add it to the query
        if (status) {
            query.dispatch = status;
        }

        const salesOrders = await SalesOrder.find(query)
            .populate('salesperson')
            .populate('customername')

        res.status(200).json({ success: true, code: 200, salesOrders });
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});

const getSingleSalesOrder = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        // Find the sales order by ID
        const salesOrder = await SalesOrder.findById(id)
            .populate('salesperson')
            .populate('customername');

        // Check if the sales order exists
        if (!salesOrder) {
            return res.status(404).json({ success: false, code: 404, message: "Sales Order not found" });
        }

        // Return the sales order
        res.status(200).json({ success: true, code: 200, salesOrder });
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});

const getLastSalesOrder = asyncHandler(async (req, res) => {
    try {
        // Find the last sales order
        const lastSalesOrder = await SalesOrder.findOne()
            .sort({ createdAt: -1 }) // Sort by createdAt date in descending order
            .populate('salesperson')
            .populate('customername');

        // Check if a sales order exists
        if (!lastSalesOrder) {
            return res.status(404).json({ success: false, code: 404, message: "No sales orders found" });
        }

        // Return the last sales order
        res.status(200).json({ success: true, code: 200, lastSalesOrder });
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});


const updateSalesOrder = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updatedFields = req.body;
        const salesOrder = await SalesOrder.findById(id);

        if (!salesOrder) {
            return res.status(404).json({ success: false, code: 404, message: "Sales Order not found" });
        }

        const originalDispatch = salesOrder.dispatch;
        salesOrder.dispatch = updatedFields.dispatch;

        if (originalDispatch !== "Done" && updatedFields.dispatch === "Done") {
            for (const productData of salesOrder.products) {
                const { meterqty, rollqty, inchsize, description, productname } = productData;

                const addstock = await Addstock.findOne({
                    productname,
                    description,
                    inchsize,
                    meterqty
                });

                if (!addstock || addstock.rollqty < rollqty) {
                    const availableRollQty = addstock ? addstock.rollqty : 0;
                    return res.status(400).json({ success: false, code: 400, message: "Insufficient roll quantity for product", availableRollQty });
                }

                let updatedRollQty = addstock.rollqty - rollqty;

                if (updatedRollQty < 0) {
                    updatedRollQty = 0; // Set to zero if it goes negative
                }

                // Update rollqty in remaining Addstock entries for the product
                const updateResult = await Addstock.updateMany(
                    {
                        productname,
                        description,
                        inchsize,
                        meterqty,
                        _id: { $gt: addstock._id } // Update entries with _id greater than deleted entry
                    },
                    { $inc: { rollqty: -rollqty } } // Decrement rollqty by 1
                );

                if (updateResult.nModified === 0) {
                    // Rollqty went into negative, rollback changes and return error
                    return res.status(400).json({ success: false, code: 400, message: "Insufficient roll quantity for product", availableRollQty: addstock.rollqty });
                }

                // Update rollqty in Addstock entry
                await Addstock.updateOne(
                    { _id: addstock._id },
                    { $set: { rollqty: updatedRollQty, totalmtr: updatedRollQty * meterqty } }
                );

                // Find and delete the corresponding entry from the qrData collection
                const qrDataEntriesBeforeDeletion = await Qrdata.find({
                    productname,
                    description,
                    inchsize,
                    meterqty
                }).sort({ uniqueid: 1 });

                // Array to store deleted qrdata details for this product
                const deletedQrData = [];

                let deletedCount = 0; // Keep track of how many entries are deleted

                // Loop through qrData entries before deletion
                for (const qrDataEntry of qrDataEntriesBeforeDeletion) {
                    if (deletedCount >= rollqty) {
                        break; // Exit loop if the required number of entries are deleted
                    }

                    // Store the details of the deleted qrdata entry
                    deletedQrData.push(qrDataEntry.toObject());

                    // Delete the qrData entry
                    await Qrdata.findByIdAndDelete(qrDataEntry._id);
                    deletedCount++;
                }

                // Update the remaining qrData entries' rollqty
                const remainingQrDataEntries = await Qrdata.find({
                    productname,
                    description,
                    inchsize,
                    meterqty
                }).sort({ uniqueid: 1 });

                const addstockrollqty = await Addstock.find({
                    productname,
                    description,
                    inchsize,
                    meterqty
                });

                // Loop through remaining qrData entries
                for (const remainingEntry of remainingQrDataEntries) {
                    // Calculate the updated rollqty
                    const updatedRollQty = remainingEntry.rollqty - rollqty;

                    // Update the rollqty in the entry
                    await Qrdata.findByIdAndUpdate(remainingEntry._id, { rollqty: addstockrollqty[0]?.rollqty });

                    // Log the updated entry
                }

                // Store the deleted qrdata details in the qualityqrs array of the product object
                const formattedDeletedQrData = deletedQrData.map(qrData => JSON.stringify(qrData));

                // Store the formatted deleted qrdata details in the qualityqrs array of the salesOrder object
                salesOrder.qualityqrs = formattedDeletedQrData;
            }
        }

        // Save the updated sales order
        await salesOrder.save();

        res.status(200).json({ success: true, code: 200, salesOrder });
    } catch (error) {
        console.error("Error updating sales order:", error);
        res.status(500).json({ success: false, code: 500, error: error.message });
    }
});

const doneUpdateSalesOrder = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updatedFields = req.body;

        const salesOrder = await SalesOrder.findById(id);

        if (!salesOrder) {
            return res.status(404).json({ success: false, code: 404, message: "Sales Order not found" });
        }

        const originalDispatch = salesOrder.dispatch;
        salesOrder.dispatch = updatedFields.dispatch;
        if (originalDispatch !== "Done" && updatedFields.dispatch === "Done") {
            const salesProduct = salesOrder.products;
            const salesQrProduct = salesOrder.qualityqrs;
            const uniqueIds = salesQrProduct.map(product => product.uniqueid);
            const roll = salesProduct.map(roll => roll.rollqty);
            const total = roll.reduce((acc, current) => acc + current, 0);

            if (salesQrProduct.length === total) {
                // Initialize an array to store matched products
                const matchedProducts = [];
                // Iterate over each product in salesProduct
                for (const product of salesProduct) {
                    // Find all products in salesQrProduct that match the conditions
                    const matchingQrProducts = salesQrProduct.filter(qrProduct => {
                        return (
                            qrProduct.productName?.toLowerCase() === product.productname?.toLowerCase() &&
                            parseFloat(qrProduct.inchsize) === product.inchsize &&
                            parseFloat(qrProduct.meterqty) === product.meterqty
                        );
                    });
                    // If matches are found, add description from salesProduct and push them into the matchedProducts array
                    if (matchingQrProducts.length > 0) {
                        matchingQrProducts.forEach(matchedProduct => {
                            // Add description from salesProduct to matchedProduct
                            matchedProduct.productName = product.productname;
                            matchedProduct.description = product.description;
                        });
                        matchedProducts.push(...matchingQrProducts);
                    }
                }
                // Delete matching documents from Qrdata model
                for (const matchedProduct of matchedProducts) {
                    const { meterqty, inchsize, description, productName, uniqueid } = matchedProduct;
                    const qr = await Qrdata.findOne({
                        productname: productName,
                        description: description,
                        inchsize: parseFloat(inchsize), // Convert inchsize to number
                        meterqty: parseFloat(meterqty), // Convert meterqty to number
                        uniqueid: uniqueid
                    });
                    if (!qr) {
                        throw new Error(`QR data not found for product: ${productName}`);
                    }
                    const deletionResult = await Qrdata.deleteOne({
                        productname: productName,
                        description: description,
                        inchsize: parseFloat(inchsize), // Convert inchsize to number
                        meterqty: parseFloat(meterqty), // Convert meterqty to number
                        uniqueid: uniqueid
                    });
                    if (!deletionResult.deletedCount) {
                        throw new Error(`Failed to delete QR data for product: ${productName}`);
                    }
                }
                // Save changes to the salesOrder
            }
        }
        await salesOrder.save();

        // Send response
        res.json({ success: true, code: 200 });
    } catch (error) {
        console.error("Error updating sales order:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const updateSalesOrderCrt = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        // Find the sales order by ID
        const salesOrder = await SalesOrder.findByIdAndUpdate(id, updatedData, { new: true });

        if (!salesOrder) {
            return res.status(404).json({ success: false, message: "Sales order not found" });
        }

        res.status(200).json({ success: true, data: salesOrder });
    } catch (error) {
        console.error("Error updating sales order:", error);
        res.status(500).json({ success: false, error: error.message });
    }
})


// const updateOldStockSalesOrder = asyncHandler(async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updatedFields = req.body;
//         const salesOrder = await SalesOrder.findById(id);

//         if (!salesOrder) {
//             return res.status(404).json({ success: false, code: 404, message: "Sales Order not found" });
//         }

//         const originalDispatch = salesOrder.dispatch;
//         salesOrder.dispatch = updatedFields.dispatch;

//         // Check if the dispatch was changed to "Done"
//         if (originalDispatch !== "Done" && updatedFields.dispatch === "Done") {
//             // Iterate through products in the sales order
//             for (const productData of salesOrder.products) {
//                 const { meterqty, rollqty, inchsize, description, productname } = productData;

//                 // Find the corresponding product in Oldstock collection based on provided details
//                 const oldstocks = await Oldstock.find({
//                     productname,
//                     description,
//                     inchsize,
//                     meterqty
//                 }).sort({ rollwisenumber: 1 }).limit(rollqty); // Limit to the number of rollqty

//                 if (oldstocks.length < rollqty) {
//                     return res.status(400).json({ success: false, code: 400, message: "Insufficient stock for product" });
//                 }

//                 // Iterate through oldstocks and remove them
//                 for (const oldstock of oldstocks) {
//                     await Oldstock.deleteOne({ _id: oldstock._id });
//                 }
//             }
//         }

//         // Save the updated sales order
//         await salesOrder.save();

//         res.status(200).json({ success: true, code: 200, salesOrder });
//     } catch (error) {
//         console.error("Error updating sales order:", error);
//         res.status(500).json({ success: false, code: 500, error: error.message });
//     }
// });


const deleteSalesOrder = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const salesOrder = await SalesOrder.findByIdAndDelete(id);
        if (!salesOrder) {
            return res.status(404).json({ success: false, code: 404, message: "Sales Order not found" });
        }
        res.status(200).json({ success: true, code: 200, message: "Sales Order deleted successfully" });
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});


module.exports = { createSalesOrder, getSalesOrders, getSingleSalesOrder, getLastSalesOrder, updateSalesOrder, doneUpdateSalesOrder, updateSalesOrderCrt, deleteSalesOrder }