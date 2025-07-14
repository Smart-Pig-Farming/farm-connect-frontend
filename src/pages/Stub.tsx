import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface StubPageProps {
  title: string;
  description?: string;
  backTo?: string;
  backToLabel?: string;
}

const StubPage = ({
  title,
  description = "This page is coming soon!",
  backTo = "/",
  backToLabel = "Back to Home",
}: StubPageProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-['Poppins'] flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="text-slate-800">Farm</span>
            <span className="text-orange-400">Connect</span>
          </h1>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚧</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
            <p className="text-slate-600">{description}</p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => navigate(backTo)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              {backToLabel}
            </Button>

            <div className="text-xs text-slate-400">
              We're working hard to bring you this feature!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StubPage;
