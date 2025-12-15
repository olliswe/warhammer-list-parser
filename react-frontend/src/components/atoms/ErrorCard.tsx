import Card from "@/components/atoms/Card.tsx";
import React from "react";

const ErrorCard = ({ text }: { text?: string }) => (
  <Card className="bg-red-300">
    <div className="text-center p-4">
      {text ?? "Error: please try again later"}
    </div>
  </Card>
);

export default ErrorCard;
