import { getUser, clearUser } from '../lib/auth';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const user = getUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-full grid place-items-center p-6">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-gray-600">Signed in as {user?.user?.email || user?.email || 'unknown'}</p>
        <div className="mt-6">
          <Button onClick={() => { clearUser(); navigate('/signin'); }}>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
