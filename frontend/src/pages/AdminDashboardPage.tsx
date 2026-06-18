import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// Define the expected structure of the user object
interface UserInfo {
  email: string;
  // Add other user properties if they are used elsewhere and known.
  // For this file, only 'email' is accessed.
}

// Get the actual return type of the useAuth hook
type AuthHookReturnType = ReturnType<typeof useAuth>;

// Define a new type that extends the original return type of useAuth
// and adds the 'user' property, which is missing in the inferred AuthContextType.
interface AuthContextWithUser extends AuthHookReturnType {
  user: UserInfo | null;
}

const AdminDashboardPage = () => {
  // Cast the return value of useAuth to include the 'user' property
  const { user, logout } = useAuth() as AuthContextWithUser;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1c1c1e] text-white p-4 flex flex-col">
        <div className="text-2xl font-bold text-[#d4a843] mb-8">Way Down South - Admin</div>
        <nav className="flex-grow">
          <ul>
            <li className="mb-2">
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `block py-2.5 px-4 rounded transition duration-200 ${
                    isActive ? 'bg-[#d4a843] text-[#1c1c1e]' : 'hover:bg-gray-700'
                  }`
                }
              >
                Dashboard
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink
                to="/admin/orders"
                className={({ isActive }) =>
                  `block py-2.5 px-4 rounded transition duration-200 ${
                    isActive ? 'bg-[#d4a843] text-[#1c1c1e]' : 'hover:bg-gray-700'
                  }`
                }
              >
                Orders
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink
                to="/admin/reservations"
                className={({ isActive }) =>
                  `block py-2.5 px-4 rounded transition duration-200 ${
                    isActive ? 'bg-[#d4a843] text-[#1c1c1e]' : 'hover:bg-gray-700'
                  }`
                }
              >
                Reservations
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink
                to="/admin/menu"
                className={({ isActive }) =>
                  `block py-2.5 px-4 rounded transition duration-200 ${
                    isActive ? 'bg-[#d4a843] text-[#1c1c1e]' : 'hover:bg-gray-700'
                  }`
                }
              >
                Menu
              </NavLink>
            </li>
          </ul>
        </nav>
        <button
          onClick={logout}
          className="mt-auto bg-[#c0392b] text-white py-2 px-4 rounded hover:bg-red-700 transition duration-200"
        >
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-8 bg-gray-100">
        <h1 className="text-3xl font-bold mb-8">Welcome, {user?.email || 'Admin'}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Today's Orders */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Today's Orders</h2>
            <p className="text-4xl font-bold text-[#d4a843]">15</p>
          </div>

          {/* Card 2: Pending Reservations */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Pending Reservations</h2>
            <p className="text-4xl font-bold text-[#d4a843]">8</p>
          </div>

          {/* Card 3: Total Menu Items */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Menu Items</h2>
            <p className="text-4xl font-bold text-[#d4a843]">42</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;