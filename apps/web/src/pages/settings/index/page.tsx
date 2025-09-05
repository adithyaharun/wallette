import { useNavigate } from "react-router";
import { useIsMobile } from "../../../hooks/use-mobile";
import SettingsForm from "../form";

export default function SettingsIndexPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!isMobile) {
    navigate("/");
    return null;
  }

  return (
    <div className="p-4">
      <SettingsForm />
    </div>
  );
}
