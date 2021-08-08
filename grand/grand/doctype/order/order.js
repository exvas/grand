// Copyright (c) 2021, sammish and contributors
// For license information, please see license.txt

function change_status(cur_frm,status) {
    cur_frm.call({
        doc: cur_frm.doc,
        method: 'change_status',
        args: {
          status: status
        },
        freeze: true,
        freeze_message: "Changing Status...",
        async: false,
        callback: (r) => {
            cur_frm.reload_doc()
        }
    })

}
frappe.ui.form.on('Order', {
    onload: function(){
        var item_name_master = frappe.meta.get_docfield("Order Item", "item_name_master", cur_frm.doc.name);
        var item_name = frappe.meta.get_docfield("Order Item", "item_name", cur_frm.doc.name);
        var item_description = frappe.meta.get_docfield("Order Item", "item_description", cur_frm.doc.name);

        item_name_master.read_only = !cur_frm.doc.reorder
        item_name.read_only = cur_frm.doc.reorder
        item_description.read_only = cur_frm.doc.reorder
    },
    refresh: function () {
       cur_frm.set_query('requirement', () => {
            return {
                filters: [
                        ["docstatus", "=", 1]
                    ]
            }
        })
        var item_name_master = frappe.meta.get_docfield("Order Item", "item_name_master", cur_frm.doc.name);
        var item_name = frappe.meta.get_docfield("Order Item", "item_name", cur_frm.doc.name);
        var item_description = frappe.meta.get_docfield("Order Item", "item_description", cur_frm.doc.name);

        item_name_master.read_only = !cur_frm.doc.reorder
        item_name.read_only = cur_frm.doc.reorder
        item_description.read_only = cur_frm.doc.reorder
        if(cur_frm.doc.with_sku <= 0 || (cur_frm.doc.with_sku > 0 && cur_frm.doc.approved_new_sku)){
            if(cur_frm.doc.workflow_state === "Identifying Competitor Product"){
                var button1 = cur_frm.add_custom_button(__("Checking Requirement"), () => {
                    change_status(cur_frm,"Checking Requirement")
                });
            } else  if( cur_frm.doc.workflow_state === "Checking Requirement"){
                var button2 = cur_frm.add_custom_button(__("Finalizing Order Quantity"), () => {
                        change_status(cur_frm,"Finalizing Order Quantity")
                });
            } else  if(cur_frm.doc.workflow_state === "Finalizing Order Quantity"){
                var button3 = cur_frm.add_custom_button(__("Negotiating Price"), () => {
                    change_status(cur_frm,"Negotiating Price")
                });
            }
        }

        if(cur_frm.doc.advance_payment){
           cur_frm.add_custom_button(__("Payment Entry"), () => {
                cur_frm.call({
                    doc: cur_frm.doc,
                    method: 'generate_payment_entry',
                    args: {},
                    freeze: true,
                    freeze_message: "Generating Payment Entry...",
                    async: false,
                    callback: (r) => {
                        cur_frm.reload_doc()
                    }
                })
            });
        }
    },
	reorder: function(frm) {
        cur_frm.clear_table("order_items")
        cur_frm.doc.requirement = ""
        cur_frm.refresh_field("order_items")
        cur_frm.refresh_field("requirement")
        var item_name_master = frappe.meta.get_docfield("Order Item", "item_name_master", cur_frm.doc.name);
        var item_name = frappe.meta.get_docfield("Order Item", "item_name", cur_frm.doc.name);
        var item_description = frappe.meta.get_docfield("Order Item", "item_description", cur_frm.doc.name);
        item_name_master.read_only = !cur_frm.doc.reorder
        item_name.read_only = cur_frm.doc.reorder
        item_description.read_only = cur_frm.doc.reorder
    },
    requirement: function(frm) {
	    cur_frm.clear_table("order_items")
        cur_frm.refresh_field("order_items")
	    if(cur_frm.doc.requirement){
	       cur_frm.call({
                doc: cur_frm.doc,
                method: 'add_item',
                args: {},
                freeze: true,
                freeze_message: "Adding Items",
                async: false,
                callback: (r) => {
                    cur_frm.refresh_field("order_items")
                }
            })
        }

    },
    create_supplier: function(frm) {
	    cur_frm.clear_table("order_items")
        cur_frm.refresh_field("order_items")
	    if(cur_frm.doc.supplier){
	       cur_frm.call({
                doc: cur_frm.doc,
                method: 'create_supplier',
                args: {},
                freeze: true,
                freeze_message: "Creating Supplier....",
                async: false,
                callback: (r) => {
                    if(r.message){
                         frappe.show_alert({
                            message:__('Supplier Created'),
                            indicator:'green'
                        }, 3);
                    }

                }
            })
        }

    },
    create_items: function(frm) {
	    cur_frm.clear_table("order_items")
        cur_frm.refresh_field("order_items")
	    if(!cur_frm.doc.reorder){
	       cur_frm.call({
                doc: cur_frm.doc,
                method: 'create_items',
                args: {},
                freeze: true,
                freeze_message: "Creating Items....",
                async: false,
                callback: (r) => {
                    if(r.message){
                         frappe.show_alert({
                            message:__('Items Created'),
                            indicator:'green'
                        }, 3);
                    }

                }
            })
        }

    },
    existing_supplier: function(frm) {
            cur_frm.doc.supplier_master = ""
            cur_frm.doc.supplier = ""
            cur_frm.doc.supplier_name = ""
            cur_frm.refresh_field("supplier_master")
            cur_frm.refresh_field("supplier")
            cur_frm.refresh_field("supplier_name")
    }
});
