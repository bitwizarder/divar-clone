import HomeContent from "./HomeContent";
import Sidebar from "../components/ui/home/Sidebar";
import CategoryList from "../components/ui/home/CatagoryList";
import MenuList from "../components/ui/home/MenuList";
const Home = () => {
  return (
    <HomeContent
      sidebar={
        <Sidebar categoryList={<CategoryList />} menuList={<MenuList />} />
      }
    />
  );
};

export default Home;
