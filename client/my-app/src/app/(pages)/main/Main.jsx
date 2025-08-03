import MainPage from "./MainPage/MainPage";
import Article from "./article/Article";

export default function Main() {
  return (
    <div className="w-full">
      <div
        className="py-8 px-5 flex justify-end"
        style={{ maxWidth: "calc(100% - 130px)" }}
      >
        <MainPage />
        <Article />
      </div>
    </div>
  );
}
