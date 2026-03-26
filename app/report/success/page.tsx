import { Suspense } from "react";
import SuccessContent from "./SuccessContent";
export default function SuccessPage() {
  return <Suspense fallback={<div className="min-h-screen" style={{background:"linear-gradient(160deg,#7bdcb5,#254252)"}}/>}><SuccessContent /></Suspense>;
}
