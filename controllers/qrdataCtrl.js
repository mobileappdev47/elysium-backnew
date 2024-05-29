const asyncHandler = require("express-async-handler");
const Qrdata = require('../models/qrdataModel');
const Addstock = require('../models/addStockModel')
const xlsx = require('xlsx')

const createQrData = asyncHandler(async (req, res) => {
    try {
        const user = req.admin;
        const qrDataArray = req.body; // Expecting an array of QR data objects in the request body

        // Check if qrDataArray is an array
        if (!Array.isArray(qrDataArray)) {
            return res.status(400).json({ success: false, code: 400, error: "Request body should be an array" });
        }

        const createdQrData = [];

        // Process each entry in the array
        for (const data of qrDataArray) {
            const { uniqueid, qrcodeid, date, jobcardnum, productname, description, meterqty, rollqty, inchsize, basepaperid, isspecificqr } = data;

            // Create a new Qrdata object and set the user reference
            const qrData = new Qrdata({
                uniqueid,
                date,
                qrcodeid,
                jobcardnum,
                basepaperid,
                productname,
                description,
                meterqty,
                rollqty,
                inchsize,
                user: user._id,
                isspecificqr
            });

            // Save the new Qrdata object
            await qrData.save();
            createdQrData.push(qrData);
        }

        res.status(201).json({ success: true, code: 201, qrData: createdQrData });
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});

const createNewQrDataFromExisting = asyncHandler(async (req, res) => {
    try {
        const { id, uniqueid } = req.params; // Taking both id and uniqueid as parameters
        const { meterqtyArray } = req.body; // Expecting an array of meterqty values in the request body
        const user = req.admin;

        // Check if meterqtyArray is an array
        if (!Array.isArray(meterqtyArray)) {
            return res.status(400).json({ success: false, code: 400, error: "Request body should contain an array of meterqty" });
        }

        // Find the existing Qrdata by id and uniqueid
        const existingQrData = await Qrdata.findOne({ _id: id, uniqueid });

        if (!existingQrData) {
            return res.status(404).json({ success: false, code: 404, message: 'Qrdata not found' });
        }

        // Calculate the total of the new meterqty values
        const totalNewMeterQty = meterqtyArray.reduce((total, qty) => total + qty, 0);

        // Check if the total of new meterqty values does not exceed the existing meterqty
        if (totalNewMeterQty > existingQrData.meterqty) {
            return res.status(400).json({ success: false, code: 400, error: "Total of new meterqty values exceeds existing meterqty" });
        }

        const createdQrData = [];
        let uniqueIdSuffix = 1;

        // Process each meterqty value in the array
        for (const meterqty of meterqtyArray) {
            // Ensure the new data matches the conditions
            if (existingQrData.productname === existingQrData.productname &&
                existingQrData.description === existingQrData.description &&
                existingQrData.inchsize === existingQrData.inchsize) {

                // Create a new Qrdata object with the provided meterqty and other details from the existing Qrdata
                const newUniqueId = `${existingQrData.uniqueid}-${uniqueIdSuffix}`;
                const qrData = new Qrdata({
                    uniqueid: newUniqueId,
                    date: existingQrData.date,
                    qrcodeid: existingQrData.qrcodeid,
                    jobcardnum: existingQrData.jobcardnum,
                    basepaperid: existingQrData.basepaperid,
                    productname: existingQrData.productname,
                    description: existingQrData.description,
                    meterqty,
                    rollqty: 1,
                    inchsize: existingQrData.inchsize,
                    user: user._id
                });

                // Save the new Qrdata object
                await qrData.save();
                createdQrData.push(qrData);
                uniqueIdSuffix++;
            } else {
                return res.status(400).json({ success: false, code: 400, error: "New Qrdata values do not match the required fields of existing Qrdata" });
            }
        }

        // Update the original Qrdata entry with iscutroll: true and cutrolldate to the current date
        await Qrdata.findByIdAndUpdate(id, { iscutroll: true, cutrolldate: new Date() });

        res.status(201).json({ success: true, code: 201, qrData: createdQrData });
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});

const addQrDataFromExcel = asyncHandler(async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }
        const user = req.admin;

        // Parse the XLSX file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        // Iterate through each row of data and add or update stock
        for (const rowData of data) {
            // Check if product already exists in the database
            const existingProduct = await Qrdata.findOne({
                productname: rowData.productname,
                description: rowData.description,
                inchsize: rowData.inchsize,
                meterqty: rowData.meterqty,
                rollqty: rowData.rollqty,
                location: rowData.location,
            });

            // Set palsanafactory and pandesraoffice based on location
            let palsanafactory = false;
            let pandesraoffice = false;

            if (rowData.location === "palsanafactory") {
                palsanafactory = true;
            } else if (rowData.location === "pandesraoffice") {
                pandesraoffice = true;
            }

            if (existingProduct) {
                // If product exists, update its rollqty, meterqty, and location fields
                existingProduct.rollqty += rowData.rollqty;
                existingProduct.totalmtr = existingProduct.rollqty * existingProduct.meterqty;
                existingProduct.palsanafactory = palsanafactory;
                existingProduct.pandesraoffice = pandesraoffice;
                await existingProduct.save();
            } else {
                // If product doesn't exist, create a new entry
                const newAddstock = new Qrdata({
                    uniqueid: rowData.uniqueid, // assuming uniqueid is a field in the Excel
                    productname: rowData.productname,
                    description: rowData.description,
                    inchsize: rowData.inchsize,
                    meterqty: rowData.meterqty,
                    rollqty: rowData.rollqty,
                    totalmtr: rowData.meterqty * rowData.rollqty,
                    location: rowData.location,
                    palsanafactory: palsanafactory,
                    pandesraoffice: pandesraoffice
                });
                newAddstock.user = user;
                await newAddstock.save();
            }
        }

        res.status(200).send("Stock added successfully.");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error.");
    }
});

const getAllQrProductNames = asyncHandler(async (req, res) => {
    try {
        // Retrieve all unique product names from the Addstock collection
        const productNames = await Qrdata.distinct('productname');

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

const createAddstockQrData = asyncHandler(async (req, res) => {
    try {
        // Find the maximum unique ID currently in the database
        const maxUniqueIdDoc = await Qrdata.findOne({}).sort({ uniqueid: -1 });
        let globalUniqueIdCounter = 1; // Initialize global counter for unique IDs

        // Query the database to fetch all Addstock data
        const addStockData = await Addstock.find();

        if (!addStockData || addStockData.length === 0) {
            return res.status(404).json({ success: false, code: 404, error: "No Addstock data found" });
        }

        const createdQrData = [];

        // Process each Addstock entry
        for (const addstock of addStockData) {
            // Extract relevant fields from Addstock data
            const { date, qrcodeid, jobcardnum, productname, description, meterqty, rollqty, inchsize } = addstock;

            // Create qrData instances based on rollqty
            for (let i = 0; i < rollqty; i++) {
                const qrData = new Qrdata({
                    uniqueid: globalUniqueIdCounter++, // Increment global unique ID for each new qrData instance
                    date,
                    qrcodeid,
                    jobcardnum,
                    productname,
                    description,
                    meterqty,
                    rollqty,
                    inchsize
                });

                // Save qrData instance
                await qrData.save();
                createdQrData.push(qrData);
            }
        }

        res.status(201).json({ success: true, code: 201, qrData: createdQrData });
    } catch (error) {
        res.status(400).json({ success: false, code: 400, error: error.message });
    }
});

const getAllQrData = asyncHandler(async (req, res) => {
    try {
        // Extracting the query parameters from the request
        const { productname, description, inchsize, meterqty, date, jobcardnum, basepaperid, uniqueid } = req.query;

        // Construct the query object based on the provided query parameters
        const query = { iscutroll: { $ne: true } }; // Exclude documents where iscutroll is true
        if (productname) {
            query.productname = productname;
        }
        if (description) {
            query.description = description;
        }
        if (inchsize) {
            query.inchsize = inchsize;
        }
        if (meterqty) {
            query.meterqty = meterqty;
        }
        if (date) {
            query.date = date;
        }
        if (jobcardnum) {
            query.jobcardnum = jobcardnum;
        }
        if (basepaperid) {
            query.basepaperid = basepaperid;
        }
        if (uniqueid) {
            query.uniqueid = { $regex: new RegExp(uniqueid) }; // Match uniqueid pattern
        }

        // Perform a search based on the constructed query
        let qrdataList = await Qrdata.find(query)
            .populate({
                path: 'user', // Specify the field to populate
                select: 'firstname _id' // Specify the fields to include
            });

        // Custom sort function for uniqueid
        qrdataList = qrdataList.sort((a, b) => {
            const uniqueIdA = a.uniqueid.split('-');
            const uniqueIdB = b.uniqueid.split('-');

            for (let i = 0; i < uniqueIdA.length; i++) {
                const partA = uniqueIdA[i];
                const partB = uniqueIdB[i];

                // Compare numeric parts numerically and string parts lexicographically
                if (!isNaN(partA) && !isNaN(partB)) {
                    const numA = parseInt(partA, 10);
                    const numB = parseInt(partB, 10);
                    if (numA !== numB) {
                        return numA - numB;
                    }
                } else {
                    if (partA !== partB) {
                        return partA.localeCompare(partB);
                    }
                }
            }
            return 0;
        }).reverse(); // Reverse the sorted array to get the opposite order

        res.json({ success: true, code: 200, qrdataList });
    } catch (error) {
        res.status(500).json({ success: false, code: 500, error: error.message });
    }
});

const getAggregatedQrData = asyncHandler(async (req, res) => {
    try {
        // Aggregate the data based on the specified fields
        const aggregatedData = await Qrdata.aggregate([
            {
                $group: {
                    _id: {
                        productname: "$productname",
                        inchsize: "$inchsize",
                        meterqty: "$meterqty",
                        description: "$description",
                        palsanafactory: "$palsanafactory",
                        pandesraoffice: "$pandesraoffice"
                    },
                    rollqty: { $sum: 1 }, // Sum rollqty
                },
            },
            {
                $project: {
                    _id: 0,
                    productname: "$_id.productname",
                    inchsize: "$_id.inchsize",
                    meterqty: "$_id.meterqty",
                    description: "$_id.description",
                    palsanafactory: "$_id.palsanafactory", // Include palsanafactory
                    pandesraoffice: "$_id.pandesraoffice", // Include pandesraoffice
                    rollqty: 1, // Include the sum of rollqty
                },
            },
        ]);

        // Iterate over the aggregated data and create or update Addstock documents
        for (const product of aggregatedData) {
            await Addstock.findOneAndUpdate(
                {
                    productname: product.productname,
                    description: product.description,
                    inchsize: product.inchsize,
                    meterqty: product.meterqty,
                    palsanafactory: product.palsanafactory,
                    pandesraoffice: product.pandesraoffice
                },
                {
                    $inc: { rollqty: product.rollqty }, // Increment rollqty by rollqty from aggregation
                },
                { upsert: true } // Create a new document if no matching one is found
            );
        }

        res.status(201).json({ success: true, code: 201, message: "Addstock created/updated successfully.", aggregatedData: aggregatedData });
    } catch (error) {
        res.status(500).json({ success: false, code: 500, error: error.message });
    }
});

const getLastQrData = asyncHandler(async (req, res) => {
    try {
        // Fetch all QR data sorted by creation date in descending order
        let qrdataList = await Qrdata.find({}).sort({ createdAt: -1 });

        if (!qrdataList.length) {
            // If no QR data found, return an appropriate response
            return res.status(404).json({ success: false, code: 404, message: "No QR data found" });
        }

        // Iterate through the sorted list and find the first valid entry
        let qrdata = null;
        for (const data of qrdataList) {
            const suffix = parseInt(data.uniqueid.split('-').pop(), 10);
            if (suffix !== 1 && suffix !== 2) {
                qrdata = data;
                break;
            }
        }

        if (!qrdata) {
            // If no valid QR data found, return an appropriate response
            return res.status(404).json({ success: false, code: 404, message: "No valid QR data found" });
        }

        res.json({ success: true, code: 200, qrdata });
    } catch (error) {
        // Handle errors
        res.status(500).json({ success: false, code: 500, error: error.message });
    }
});

const getSpecificProductData = asyncHandler(async (req, res) => {
    try {
        // Aggregate the data based on the specified fields
        const aggregatedData = await Qrdata.aggregate([
            {
                $group: {
                    _id: {
                        productname: "$productname",
                        inchsize: "$inchsize",
                        meterqty: "$meterqty",
                        description: "$description",
                        palsanafactory: "$palsanafactory",
                        pandesraoffice: "$pandesraoffice"
                    },
                    rollqty: { $sum: 1 }, // Sum rollqty
                },
            },
            {
                $project: {
                    _id: 0,
                    productname: "$_id.productname",
                    inchsize: "$_id.inchsize",
                    meterqty: "$_id.meterqty",
                    description: "$_id.description",
                    palsanafactory: "$_id.palsanafactory", // Include palsanafactory
                    pandesraoffice: "$_id.pandesraoffice", // Include pandesraoffice
                    rollqty: 1, // Include the sum of rollqty
                },
            },
        ]);

        // Iterate over the aggregated data and create or update Addstock documents
        for (const product of aggregatedData) {
            await Addstock.findOneAndUpdate(
                {
                    productname: product.productname,
                    description: product.description,
                    inchsize: product.inchsize,
                    meterqty: product.meterqty,
                    palsanafactory: product.palsanafactory,
                    pandesraoffice: product.pandesraoffice
                },
                {
                    $inc: { rollqty: product.rollqty }, // Increment rollqty by rollqty from aggregation
                },
                { upsert: true } // Create a new document if no matching one is found
            );
        }

        res.status(201).json({ success: true, code: 201, message: "Addstock created/updated successfully.", aggregatedData: aggregatedData });
    } catch (error) {
        res.status(500).json({ success: false, code: 500, error: error.message });
    }
});




const generateExcelFile = async () => {
    try {
        // Fetch data from Qrdata model
        const qrdata = await Qrdata.find().sort({ updatedAt: -1 });

        // If no data found, throw an error
        if (!qrdata || qrdata.length === 0) {
            throw new Error('No data found');
        }

        // Prepare the data for the worksheet
        const jsonData = qrdata.map(data => {
            let location = '';
            if (data.pandesraoffice) {
                location = 'Pandesra Office';
            } else if (data.palsanafactory) {
                location = 'Palsana Factory';
            }
            return {
                'uniqueid': data.uniqueid,
                'date': data.date,
                'jobcardnum': data.jobcardnum,
                'ProductName': data.productname,
                'Description': data.description,
                'InchSize': data.inchsize,
                'MeterQty': data.meterqty,
                'RollQty': data.rollqty,
                'TotalMtr': data.meterqty * data.rollqty, // Calculate total meter based on meterqty and rollqty
                'Location': location // Add the location field
            };
        });

        // Create a new workbook and add the data
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(jsonData);

        // Set column headers
        ws['!cols'] = [
            { wch: 20 }, // uniqueid
            { wch: 20 }, // date
            { wch: 20 }, // jobcardnum
            { wch: 20 }, // ProductName
            { wch: 30 }, // Description
            { wch: 10 }, // InchSize
            { wch: 10 }, // MeterQty
            { wch: 10 }, // RollQty
            { wch: 15 }, // TotalMtr
            { wch: 20 }  // Location
        ];

        // Add the worksheet to the workbook
        xlsx.utils.book_append_sheet(wb, ws, 'Qr Data');

        // Write the workbook to a buffer
        const excelBuffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        return excelBuffer;
    } catch (error) {
        // Log the error for debugging
        console.error(error);
        throw new Error('Failed to generate Excel file');
    }
};

const getQrData = asyncHandler(async (req, res) => {
    try {
        const qrdata = await Qrdata.findById(req.params.id);
        if (!qrdata) {
            return res.status(404).json({ success: false, code: 404, message: 'Qrdata not found' });
        }
        res.json(qrdata);
    } catch (error) {
        res.status(500).json({ success: false, code: 500, error: error.message });
    }
});


const updateQrData = asyncHandler(async (req, res) => {
    try {
        // Fetch the existing Qrdata document
        const existingQrData = await Qrdata.findById(req.params.id);
        if (!existingQrData) {
            return res.status(404).json({ success: false, code: 404, message: 'Qrdata not found' });
        }

        // Check if productname is being updated and differs from the existing one
        if (req.body.productname && req.body.productname !== existingQrData.productname) {
            req.body.isnamechange = true;
            req.body.oldproductname = existingQrData.productname;
            req.body.namechangedate = new Date();  // Set cutrolldate to the current date
        }

        // Update the Qrdata document with the new values
        const updatedQrData = await Qrdata.findByIdAndUpdate(req.params.id, req.body, { new: true });

        res.json({ success: true, code: 200, qrdata: updatedQrData });
    } catch (error) {
        res.status(500).json({ success: false, code: 500, error: error.message });
    }
});

const updateQrDataByUniqueId = asyncHandler(async (req, res) => {
    try {
        const { uniqueIds, palsanafactory, pandesraoffice } = req.body;

        // Check if uniqueIds is an array
        if (!Array.isArray(uniqueIds)) {
            return res.status(400).json({ success: false, code: 400, message: "uniqueIds should be an array" });
        }

        // Update the specified fields for all documents that match the uniqueIds
        const result = await Qrdata.updateMany(
            { uniqueid: { $in: uniqueIds } }, // Filter by uniqueIds
            {
                palsanafactory,
                pandesraoffice,
                islocation: true,
                locationdate: new Date() // Set locationdate to the current date
            }
        );

        // Check if any records were updated
        if (result.nModified === 0) {
            return res.status(404).json({ success: false, code: 404, message: 'No records found to update' });
        }

        res.json({ success: true, code: 200, message: `${result.nModified} records updated` });
    } catch (error) {
        res.status(500).json({ success: false, code: 500, error: error.message });
    }
});

const incrementCount = asyncHandler(async (req, res) => {
    try {
        // Extracting the array of IDs from the request body
        const { ids } = req.body;

        // Iterate over each ID and update the count field
        await Promise.all(ids.map(async (id) => {
            await Qrdata.updateOne(
                { _id: id }, // Find document with the provided ID
                { $inc: { count: 1 } } // Increment the count field by 1
            );
        }));

        // Sending a success response
        res.json({ success: true, code: 200, message: 'Count incremented successfully' });
    } catch (error) {
        // Sending an error response if an exception occurs
        res.status(500).json({ success: false, code: 500, error: error.message });
    }
});

const deleteQrData = asyncHandler(async (req, res) => {
    try {
        const qrdata = await Qrdata.findByIdAndDelete(req.params.id);
        if (!qrdata) {
            return res.status(404).json({ success: false, code: 404, message: 'Qrdata not found' });
        }
        res.json({ success: true, code: 200, message: 'Qrdata deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, code: 500, error: error.message });
    }
});

const deleteQrDataByQrCodeId = asyncHandler(async (req, res) => {
    try {
        const { qrcodeid } = req.body;

        // Check if qrcodeids array is provided
        if (!Array.isArray(qrcodeid) || qrcodeid.length === 0) {
            return res.status(400).json({ success: false, code: 400, error: "qrcodeids array is required" });
        }

        // Delete documents where qrcodeid matches any in the provided array
        const result = await Qrdata.deleteMany({ qrcodeid: { $in: qrcodeid } });

        res.json({ success: true, code: 200, message: `${result.deletedCount} documents deleted` });
    } catch (error) {
        res.status(500).json({ success: false, code: 500, error: error.message });
    }
});

const deleteAllQrdata = asyncHandler(async (req, res) => {
    try {
        // Use deleteMany() to clear all data from the Qrdata collection
        const deletionResult = await Qrdata.deleteMany({});
        if (deletionResult.deletedCount > 0) {
            res.json({ success: true, message: 'All data cleared from Qrdata model' });
        } else {
            res.status(404).json({ success: false, message: 'No data found in Qrdata model' });
        }
    } catch (error) {
        console.error("Error clearing data from Qrdata model:", error);
        res.status(500).json({ success: false, error: error.message });
    }
})


module.exports = {
    createQrData, createNewQrDataFromExisting, addQrDataFromExcel, createAddstockQrData, getAllQrData, getAggregatedQrData, getLastQrData, getAllQrProductNames,
    getSpecificProductData, generateExcelFile, getQrData, updateQrData, updateQrDataByUniqueId,
    incrementCount, deleteQrData, deleteQrDataByQrCodeId, deleteAllQrdata
};