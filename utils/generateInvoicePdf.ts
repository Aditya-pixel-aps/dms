import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface InvoicePdfData {
  id: number; // Order number
  status: string;
  order_date: string;
  retailer_name: string;
  retailer_address?: string | null;
  retailer_phone?: string | null;
  salesman_name?: string | null;
  invoice_id?: number | null;
  invoice_date?: string | null;
  items: {
    product_id: number;
    product_name: string;
    qty: number;
    unit_price: number;
  }[];
}

const formatCurrency = (value: number) => `Rs ${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export function generateInvoicePdf(order: InvoicePdfData) {
  // Create A4 PDF: 210mm x 297mm
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryColor = [15, 23, 42]; // Slate 900: #0f172a
  const secondaryColor = [79, 70, 229]; // Indigo 600: #4f46e5
  const textColor = [55, 65, 81]; // Gray 700: #374151
  const lightTextColor = [107, 114, 128]; // Gray 500: #6b7280

  // 1. Header (Company Info & Invoice Heading)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("DMS DISTRIBUTOR", 15, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text("Main Warehouse, Industrial Area Phase 1", 15, 25);
  doc.text("Phone: +91 98765 43210 | Email: support@dmsdistributor.com", 15, 29);

  // TAX INVOICE Title
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("TAX INVOICE", 200 - 15, 20, { align: "right" });

  // Divider Line
  doc.setDrawColor(229, 231, 235); // Gray 200
  doc.setLineWidth(0.5);
  doc.line(15, 34, 195, 34);

  // 2. Invoice Details Block
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("INVOICE DETAILS", 15, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  const invoiceNo = order.invoice_id ? `INV-${order.invoice_id}` : `ORD-${order.id}`;
  const invoiceDate = order.invoice_date ? formatDate(order.invoice_date) : formatDate(order.order_date);

  doc.text(`Invoice No:      ${invoiceNo}`, 15, 48);
  doc.text(`Invoice Date:    ${invoiceDate}`, 15, 53);
  doc.text(`Order Number:    #${order.id}`, 15, 58);
  doc.text(`Order Date:      ${formatDate(order.order_date)}`, 15, 63);

  // 3. Salesman & Route Block (Top Right)
  const rightColX = 130;
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text("DISTRIBUTION DETAILS", rightColX, 42);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Salesman:        ${order.salesman_name || "Direct / N/A"}`, rightColX, 48);
  doc.text(`Status:          ${order.status}`, rightColX, 53);

  // Divider Line
  doc.line(15, 68, 195, 68);

  // 4. Customer Billing Details (Bill To)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO (RETAILER)", 15, 75);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(order.retailer_name, 15, 81);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  // Format Address (handle long text and split line if needed)
  const address = order.retailer_address || "No Address Provided";
  const splitAddress = doc.splitTextToSize(address, 100);
  doc.text(splitAddress, 15, 86);

  const phoneY = 86 + (splitAddress.length * 4.5);
  doc.text(`Phone: ${order.retailer_phone || "N/A"}`, 15, phoneY);

  // 5. Items Table
  const tableStartY = phoneY + 8;
  const tableBody = order.items.map((item, index) => [
    (index + 1).toString(),
    item.product_name,
    item.qty.toString(),
    formatCurrency(item.unit_price),
    formatCurrency(item.qty * item.unit_price),
  ]);

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: 15, right: 15 },
    head: [["S.No", "Product Name", "Qty", "Unit Price", "Subtotal"]],
    body: tableBody,
    theme: "striped",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 15, halign: "center" },
      1: { cellWidth: 90 },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 25, halign: "right" },
      4: { cellWidth: 30, halign: "right" },
    },
    styles: {
      fontSize: 8.5,
      textColor: [55, 65, 81],
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
    },
  });

  // Get final Y position of the table
  let finalY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || tableStartY + 20;

  // Check if we have enough room for Totals and Footer, else add page
  if (finalY > 230) {
    doc.addPage();
    finalY = 20;
  }

  // 6. Financial Calculations
  const subtotal = order.items.reduce((sum, item) => sum + item.qty * item.unit_price, 0);
  const tax = Math.round(subtotal * 0.12);
  const total = subtotal + tax;

  const totalLabelX = 135;
  const totalValX = 195;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  doc.text("Subtotal:", totalLabelX, finalY + 10);
  doc.text(formatCurrency(subtotal), totalValX, finalY + 10, { align: "right" });

  doc.text("Tax (GST 12%):", totalLabelX, finalY + 15);
  doc.text(formatCurrency(tax), totalValX, finalY + 15, { align: "right" });

  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(totalLabelX, finalY + 19, totalValX, finalY + 19);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text("Grand Total:", totalLabelX, finalY + 25);
  doc.text(formatCurrency(total), totalValX, finalY + 25, { align: "right" });

  // 7. Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  
  // Footer text line
  const footerY = 280;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(15, footerY - 5, 195, footerY - 5);

  doc.text("Thank you for your business!", 15, footerY);
  doc.text("This is a computer-generated invoice and does not require a physical signature.", 200 - 15, footerY, { align: "right" });

  // Save the PDF
  const filename = order.invoice_id ? `Invoice-${order.invoice_id}.pdf` : `Invoice-Order-${order.id}.pdf`;
  doc.save(filename);
}
