import Link from "next/link";
import ToolPage from "../utils/ToolPage";

const APIPage: ToolPage = () => (
  <>
    <h2>Tool List</h2>
    
    <p>
      <code>
        <Link href="/tools.json">tools.json</Link>
      </code>
    </p>
        
  </>
);

export default APIPage;
