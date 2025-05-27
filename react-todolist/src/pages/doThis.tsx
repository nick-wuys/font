import { useParams } from "react-router";

export const DoThis = (props: any) => {
  const params = useParams();

  return <div>do this {params.id}</div>;
};
