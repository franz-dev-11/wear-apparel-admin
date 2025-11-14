import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient.jsx";
import MessageDisplay from "../components/MessageDisplay.jsx";
// Removed: Mail, RefreshCw import

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  // Removed: [sendingEmail, setSendingEmail] state

  // *** 1. FETCH USERS ***
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      // Assuming your public 'users' table has 'full_name', 'phone', and 'email' columns
      // If 'email' is only in auth.users, you must store it in the public 'users' table via a trigger.
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, phone, email") // Select the columns to display
        .order("full_name", { ascending: true });

      if (error) throw error;
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage({
        type: "error",
        text: `Failed to load users: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Removed: *** 2. SEND RESET LINK *** function

  return (
    <div className='p-6'>
      <h1 className='text-[#121212] font-extrabold text-6xl mb-10'>Admins</h1>
      <h2 className='text-xl font-semibold text-gray-800 mb-2'>
        List of Admin Accounts:
      </h2>
      <h2 className='text-2xl font-bold mb-4'>User Management</h2>
      {message && <MessageDisplay message={message} />}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className='overflow-x-auto bg-white shadow-lg rounded-lg'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Full Name
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Email
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Phone
                </th>
                {/* Removed: Password Actions column header */}
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {user.full_name}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {user.email}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {user.phone || "N/A"}
                  </td>

                  {/* Removed: BUTTON FOR RESET LINK TD */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserTable;
