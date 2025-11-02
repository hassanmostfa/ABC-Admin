import { useState, useCallback } from 'react';
import { Navbar, NavbarCollapse } from 'flowbite-react';
import { IconChevronDown } from '@tabler/icons-react';
import ChildComponent from './ChildComponent';
import { Icon } from "@iconify/react";
import Menuitems from '../MenuData';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LanguageSelector } from './LanguageSelector';

// Define proper types for menu items
interface MenuChild {
  id: string;
  title: string;
  icon: string;
  href: string;
  children?: MenuChild[];
}

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  href: string;
  column?: number;
  children?: MenuChild[];
}

const Navigation = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [active, setActive] = useState(Menuitems[0].id);
  const pathname = usePathname();

  const handleDropdownEnter = useCallback((itemId: string) => {
    setActiveDropdown(itemId);
    setActive(itemId);
  }, []);

  const handleDropdownLeave = useCallback(() => {
    setActiveDropdown(null);
  }, []);

  const handleChildClick = useCallback((parentId: string) => {
    setActive(parentId);
  }, []);

  const isItemActive = useCallback((item: MenuItem) => {
    let isActive = false;
    item.children?.find((child: MenuChild) => {
      if (child?.children) {
        let nestedvalue = child.children.find((value: MenuChild) => value.href === pathname);
        if (nestedvalue) { isActive = true; }
      } else {
        let value = child.href === pathname;
        if (value) { isActive = true; }
      }
    });
    return isActive;
  }, [pathname]);

  return (
    <Navbar fluid={true} rounded={true} className="horizontal-nav bg-transparent dark:bg-transparent sm:px-0 xl:py-4 py-0">
      <NavbarCollapse className="xl:block">
        <div className="flex items-center justify-between w-full">
          <ul className="flex items-center space-x-3">
            {(Menuitems as MenuItem[]).map((item) => {
              const isActive = isItemActive(item);
              return (
                <li key={item.id} className="relative group">
                  {item.children ? (
                    <div
                      className="relative group"
                      onMouseEnter={() => handleDropdownEnter(item.id)}
                    >
                      <p
                        className={`w-full ${
                          isActive
                            ? 'text-white bg-primary shadow-btnshdw'
                            : 'group-hover:bg-lightprimary group-hover:text-primary'
                        } py-2 px-3 rounded-md flex gap-3 items-center text-ld`}
                      >
                        <Link href={item.href}>
                          <span className="flex gap-2 items-center w-full">
                            <Icon icon={`${item.icon}`} height={18} />
                            <span>{item.title}</span>
                            {item.children && <IconChevronDown size={18} className="ms-auto" />}
                          </span>
                        </Link>
                      </p>
                      {activeDropdown === item.id && (
                        <div
                          className={`absolute left-0 rtl:right-0 mt-2 bg-white dark:bg-dark rounded-md shadow-lg ${
                            item.column === 4 ? 'w-screen max-w-[800px]' : 'w-52'
                          }`}
                          onMouseEnter={() => handleDropdownEnter(item.id)}
                          onMouseLeave={handleDropdownLeave}
                        >
                          <ul
                            className={`p-3 text-sm gap-2 ${
                              item.column === 4 ? 'two-cols' : 'flex flex-col'
                            }`}
                          >
                            {item.children.map((child) => (
                              <li key={child.id} className={`${item.column === 4 ? 'mb-2' : ''}`}>
                                <ChildComponent
                                  item={child}
                                  title={item.title}
                                  isActive={activeDropdown === item.id}
                                  handleMouseEnter={() => handleDropdownEnter(item.id)}
                                  handleMouseLeave={handleDropdownLeave}
                                  onClick={() => handleChildClick(item.id)}
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link href={item.href}>
                      <p
                        className={`py-2 px-3 rounded-md flex gap-3 items-center ${
                          active === item.id
                            ? 'bg-error text-white'
                            : 'group-hover/nav:bg-primary group-hover/nav:text-primary'
                        }`}
                      >
                        <Icon icon={`${item.icon}`} height={18} />
                        <span>{item.title}</span>
                      </p>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="flex items-center">
            <LanguageSelector />
          </div>
        </div>
      </NavbarCollapse>
    </Navbar>
  );
};

export default Navigation;