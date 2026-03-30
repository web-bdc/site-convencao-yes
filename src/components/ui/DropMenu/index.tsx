import { Menu } from "lucide-react";
import MenuList from "../../layout/Header/MenuList/index";
import Sheet from "../SheetMenu";
import styles from "./styles.module.css";

export default function DropMenu() {
  return (
    <Sheet
      trigger={
        <button className={styles.menuButton}>
          <Menu className={styles.menuIcon} /> {/*icon de menu*/}
        </button>
      }
    >
      <MenuList />
    </Sheet>
  );
}
