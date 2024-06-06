const asyncHandler = require("express-async-handler");
const SalesOrder = require('../models/salesOrderModel')
const Addstock = require('../models/addStockModel');
// const Oldstock = require("../models/oldStockModel");
const Qrdata = require("../models/qrdataModel")
const xlsx = require('xlsx')

const createSalesOrder = asyncHandler(async (req, res) => {
    try {
        const user = req.admin;
        const {
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
            salesdate,
            customername,
            ordernumber,
            salesperson,
            products, // Assuming this is an array of products
            dispatch,
            customernotes,
            totalroll,
            totalmeter,
            user: user._id
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

        // Fetch sales orders with sorting by creation date in descending order
        const salesOrders = await SalesOrder.find(query)
            .populate({
                path: 'user', // Specify the field to populate
                select: 'firstname _id' // Specify the fields to include
            })
            .populate('salesperson')
            .populate('customername')
            .sort({ createdAt: -1 }); // -1 for descending order

        res.status(200).json({ success: true, code: 200, salesOrders });
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});


const generateExcelFile = async () => {
    try {
        // Fetch data from SalesOrder model
        const salesOrders = await SalesOrder.find().populate('customername salesperson').sort({ updatedAt: -1 });

        // If no data found, throw an error
        if (!salesOrders || salesOrders.length === 0) {
            throw new Error('No data found');
        }

        // Prepare the data for the worksheet
        let jsonData = [];

        salesOrders.forEach(order => {
            order.products.forEach(product => {
                for (let i = 0; i < product.rollqty; i++) {
                    jsonData.push({
                        'Order Number': order.ordernumber,
                        'Sales Date': order.salesdate,
                        'Challan Date': order.challandate,
                        'Challan Number': order.challannumber,
                        'Customer Name': order.customername.customername ? order.customername.customername : '', // Assuming customer name is stored in the 'name' field
                        'Salesperson': order.salesperson.salesname ? order.salesperson.salesname : '', // Assuming salesperson name is stored in the 'name' field
                        'Product Name': product.productname,
                        'Description': product.description,
                        'Inch Size': product.inchsize,
                        'Roll Quantity': 1, // Each entry represents one roll
                        'Meter Quantity': product.meterqty,
                        'Total Meters': product.meterqty,
                        'Package': order.package,
                        'Dispatch': order.dispatch,
                        'Customer Notes': order.customernotes,
                        'Total Roll': order.totalroll,
                        'Total Meter': order.totalmeter,
                        'Cancel Reason': order.cancelreason,
                        'Created At': order.createdAt,
                        'Updated At': order.updatedAt
                    });
                }
            });
        });

        // Create a new workbook and add the data
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(jsonData);

        // Set column headers
        ws['!cols'] = [
            { wch: 20 }, // Order Number
            { wch: 20 }, // Sales Date
            { wch: 20 }, // Challan Date
            { wch: 20 }, // Challan Number
            { wch: 30 }, // Customer Name
            { wch: 30 }, // Salesperson
            { wch: 30 }, // Product Name
            { wch: 30 }, // Description
            { wch: 10 }, // Inch Size
            { wch: 10 }, // Roll Quantity
            { wch: 15 }, // Meter Quantity
            { wch: 15 }, // Total Meters
            { wch: 20 }, // Package
            { wch: 20 }, // Dispatch
            { wch: 30 }, // Customer Notes
            { wch: 15 }, // Total Roll
            { wch: 15 }, // Total Meter
            { wch: 30 }, // Cancel Reason
            { wch: 30 }, // Created At
            { wch: 30 }, // Updated At
        ];

        // Add the worksheet to the workbook
        xlsx.utils.book_append_sheet(wb, ws, 'Sales Orders');

        // Write the workbook to a buffer
        const excelBuffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        return excelBuffer;
    } catch (error) {
        // Log the error for debugging
        console.error(error);
        throw new Error('Failed to generate Excel file');
    }
};

const getCustomerNamesAndIds = asyncHandler(async (req, res) => {
    try {
        // Fetch all sales orders
        const salesOrders = await SalesOrder.find({})
            .populate('customername')
            .select('customername -_id');

        // Extract unique customer names and IDs
        const uniqueCustomers = {};

        salesOrders.forEach(order => {
            const customer = order.customername;
            if (customer && !uniqueCustomers[customer._id]) {
                uniqueCustomers[customer._id] = { id: customer._id, name: customer.customername };
            }
        });

        const customerArray = Object.values(uniqueCustomers);

        res.status(200).json({ success: true, code: 200, customers: customerArray });
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

const getSalesFromUniquid = asyncHandler(async (req, res) => {
    try {
        const uniqueid = req.params.uniqueid;

        // Find the first sales order that contains the uniqueid in their orderedproduct array
        const order = await SalesOrder.findOne({ "orderedproduct.uniqueid": uniqueid }).populate('customername');

        if (!order) {
            return res.status(404).json({ success: false, code: 404, message: "No orders found with the given uniqueid" });
        }

        // Extract the orderedproduct details with the specific uniqueid
        const productDetails = order.orderedproduct.find(product => product.uniqueid === uniqueid);

        if (!productDetails) {
            return res.status(404).json({ success: false, code: 404, message: "No product found with the given uniqueid" });
        }

        const orderDetails = {
            ...productDetails, // Spread product details
            partyname: order.customername // Adjust this if your customername schema is different
        };

        res.json({ success: true, code: 200, orderDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, code: 500, message: "Server error" });
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

const getLastUpdatedCRTPendingOrder = asyncHandler(async (req, res) => {
    try {
        // Find the last sales order
        const lastSalesOrder = await SalesOrder.findOne({ package: 'CRT Pending' })
            .sort({ createdAt: -1 }) // Sort by createdAt date in descending order

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

        if (originalDispatch !== "Order Closed" && updatedFields.dispatch === "Order Closed") {
            const uniqueIds = salesOrder.qualityqrs.map(qrProduct => qrProduct.uniqueid);

            // Check roll quantity
            for (const product of salesOrder.products) {
                const productQrEntries = salesOrder.qualityqrs.filter(qr => qr.productName === product.productname);

                if (product.rollqty !== productQrEntries.length) {
                    return res.status(400).json({
                        success: false,
                        code: 400,
                        message: `Product roll quantity mismatch for product: ${product.productname}`
                    });
                }
            }

            // Compare the products with the sales order qualityqrs
            const mismatchedProducts = [];
            for (const qrProduct of salesOrder.qualityqrs) {
                const product = salesOrder.products.find(p =>
                    p.productname === qrProduct.productName &&
                    p.inchsize.toString() === qrProduct.inchsize &&
                    p.meterqty.toString() === qrProduct.meterqty
                );

                if (!product) {
                    mismatchedProducts.push(qrProduct.uniqueid);
                }
            }

            if (mismatchedProducts.length > 0) {
                return res.status(400).json({
                    success: false,
                    code: 400,
                    message: `Product mismatch found for unique IDs: ${mismatchedProducts.join(', ')}`
                });
            }

            console.log(uniqueIds, 'uniqueid');

            // Find QR data to be deleted
            let qrDataToDelete = await Qrdata.find({
                uniqueid: { $in: uniqueIds }
            });

            console.log("QR Data to be deleted:", qrDataToDelete);

            // Filter unique QR data entries
            const uniqueQrDataMap = new Map();
            qrDataToDelete.forEach(qrData => {
                uniqueQrDataMap.set(qrData.uniqueid, qrData);
            });
            qrDataToDelete = Array.from(uniqueQrDataMap.values());

            console.log("Filtered unique QR Data:", qrDataToDelete);

            // Delete the QR data
            const deleteResult = await Qrdata.deleteMany(
                { uniqueid: { $in: uniqueIds } }
            );

            console.log("Delete result:", deleteResult);

            if (deleteResult.deletedCount === 0) {
                throw new Error("Failed to delete QR data");
            }

            // Add only the unique deleted QR data to orderedproduct in salesOrder
            salesOrder.orderedproduct = salesOrder.orderedproduct.concat(qrDataToDelete);

        }

        const doneOrder = await salesOrder.save();

        res.json({ success: true, code: 200, message: "Sales Order updated and QR data deleted and added to orderedproduct", doneOrder });
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

const deletePendingProduct = asyncHandler(async (req, res) => {
    const { orderId, qualityId } = req.params;

    try {
        const salesOrder = await SalesOrder.findById(orderId);

        if (!salesOrder) {
            return res.status(404).send({ success: false, code: 404, error: 'SalesOrder not found' });
        }

        // Find the index of the pendingquality item to remove
        const qualityIndex = salesOrder.pendingquality.findIndex(
            (item) => item._id.toString() === qualityId
        );

        if (qualityIndex === -1) {
            return res.status(404).send({ success: false, code: 404, error: 'Pending quality item not found' });
        }

        // Remove the item from the array
        const removedItem = salesOrder.pendingquality.splice(qualityIndex, 1)[0];

        // Add the removed item to the cancelpending array
        salesOrder.cancelpending.push(removedItem);

        // Save the updated sales order
        await salesOrder.save();

        res.status(200).send({ success: true, code: 200, message: 'Pending quality item removed and added to cancelpending', salesOrder });
    } catch (error) {
        res.status(500).send({ success: false, code: 500, error: 'An error occurred', details: error.message });
    }
});

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


module.exports = {
    createSalesOrder, getSalesOrders, generateExcelFile, getCustomerNamesAndIds, getSingleSalesOrder, getSalesFromUniquid, getLastSalesOrder, getLastUpdatedCRTPendingOrder,
    updateSalesOrder, doneUpdateSalesOrder, updateSalesOrderCrt, deletePendingProduct, deleteSalesOrder
}