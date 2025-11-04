import { supabase } from "../supabaseClient"; // 💡 Import the client here

/**
 * Fetches all orders from the 'orders' table.
 */
export async function fetchAllOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error.message);
    throw error;
  }
  return data;
}

/**
 * Updates the status (payment and/or delivery) for a specific order.
 */
export async function updateOrderStatus(orderId, updates) {
  const { error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", orderId);

  if (error) {
    console.error(`Error updating order ${orderId}:`, error.message);
    throw error;
  }
}
