const PDFDocument = require("pdfkit");
const path = require("path");
const user = require('../models/userSchema');

// Table Row with Bottom Line
function generateTableRow(doc, y, c1, c2, c3, c4, c5, c6, c7) {
  doc
    .fontSize(10)
    .text(c1, 50, y)
    .text(c2, 100, y)
    .text(c3, 220, y)
    .text(c4, 270, y)
    .text(c5, 340, y)
    .text(c6, 400, y, { width: 90, align: "right" })
    .text(c7, 0, y, { align: "right" })
    .moveTo(50, y + 15)
    .lineTo(560, y + 15)
    .lineWidth(0.5)
    .strokeColor("#ccc")
    .stroke();
}

// Table row without bottom line
function generateTableRowNoLine1(doc, y, c1, c2, c3, c4, c5) {
  doc
    .fontSize(10)
    .text(c1, 50, y)
    .text(c2, 100, y)
    .text(c3, 280, y)
    .text(c4, 370, y, { width: 90, align: "right" })
    .text(c5, 0, y, { align: "right" });
}

function generateTableRowNoLine2(doc, y, c1, c2, c3, c4, c5) {
  doc
    .fontSize(10)
    .text(c1, 50, y)
    .text(c2, 100, y)
    .text(c3, 280, y)
    .text(c4, 370, y, { width: 90, align: "right" })
    .text(c5, 0, y, { align: "right" });
}

function generateTableRowNoLine3(doc, y, c1, c2, c3, c4, c5) {
  doc
    .fontSize(10)
    .text(c1, 50, y)
    .text(c2, 100, y)
    .text(c3, 280, y)
    .text(c4, 370, y, { width: 90, align: "right" })
    .text(c5, 0, y, { align: "right" });
}

// Generating Invoice for customers
const generateInvoicePDF = async (order,userData) => {
  return new Promise((resolve, reject) => {
    try {
      // const imagePath = "Trainers"
      // path.join(__dirname, "../public/assets/zeecart.png");
      const doc = new PDFDocument({ margin: 50 });

      const buffers = [];
      doc.on("data", (buffer) => buffers.push(buffer));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (error) => reject(error));

      // Header for the PDF
      doc
        // .image(imagePath, 50, 45, { width: 180 })
        .fillColor("#444444")
        .fontSize(20)
        // .fontSize(4)
        .text("Trainers Cricket Zone", 200, 65, { align: "right" })        
        .moveDown();


        doc
        // .image(imagePath, 50, 45, { width: 180 })
        .fillColor("#444444")
        .fontSize(20)
        .fontSize(10)
        // .text("Trainers Cricket Zone", 200, 65, { align: "right" })
        .text("7th Avenue, Sector 801", 200, 85, { align: "right" })
        .text("Calicut, Kerala, IN", 200, 100, { align: "right" })
        .moveDown();

      // Invoice details section
      doc
        .fontSize(20)
        .text("Invoice", 50, 150)
        .fontSize(10)
        .moveTo(50, 190)
        .lineTo(550, 190)
        .lineWidth(0.5)
        .strokeColor("#ccc")
        .stroke()
        .text(`Order Id: ${order._id}`, 50, 200)
         .text(`Order Date: ${order.orderDate.toLocaleDateString()}`, 50, 215)
        .text(
          `Total Amount:Rs.${order.totalAmount}`,
          50,
          230
        )
        .text(order.address.name, 380, 200)
        .text(order.address.addressLane +","+ order.address.city, 375, 213)
        .text(
          `${order.address.state}-${order.address.pincode}`,
          380,
          228
        )
        .text(
          `${order.address.mobile}, ${order.address.altMobile}`,
          380,
          240
        )
        .moveTo(50, 250)
        .lineTo(550, 250)
        .lineWidth(0.5)
        .strokeColor("#ccc")
        .stroke()
        .moveDown();

      // Products
      let i;
      const invoiceTableTop = 330;

      // Table Header
      generateTableRow(
        doc,
        invoiceTableTop,
        "SL No",
        "Product Name",
        "   ",
        "   ",
        "Quantity",
        "Price",
        "Sub Total"
      );
    
      
      for (i = 0; i < order.items.length; i++) {
            const position = invoiceTableTop + (i + 1) * 30;
            const item = order.items;          

        generateTableRow(
          doc,
          position,
          i + 1,
          item[i].productId.name,
          "",
          "",
          item[i].quantity,
          // item[i].productId.price-item[i].productId.discount,
          item[i].productId.offerprice||item[i].productId.price-item[i].productId.discount,
          (item[i].productId.offerprice)*item[i].quantity||(item[i].productId.price-item[i].productId.discount) * item[i].quantity
        );
       }

      const subtotalPosition1 = invoiceTableTop + (i + 1) * 30;
      generateTableRowNoLine1(
        doc,
        subtotalPosition1,
        "",
        "",
        "",
        "Sub Total",
        order.totalAmount
      );

      const subtotalPosition2 = invoiceTableTop + (i + 1) * 40;
      generateTableRowNoLine2(
        doc,
        subtotalPosition2,
        "",
        "",
        "",
        "Coupon Discount",
        order.couponDiscount || 0
      );

      const subtotalPosition3 = invoiceTableTop + (i + 1) * 50;
      generateTableRowNoLine3(
        doc,
        subtotalPosition3,
        "",
        "",
        "",
        "Total Amount",
        order.totalAmount
      );



      // Footer for the PDF
      doc
        .fontSize(10)
        .text(
          "Payment has been received. Thank you for your business.",
          50,
          700,
          { align: "center", width: 500 }
        );

      // End the document
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateInvoicePDF,
};
