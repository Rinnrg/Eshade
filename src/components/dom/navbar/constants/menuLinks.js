// Function to generate menu links with dynamic categories
export const getMenuLinks = (categories = []) => {
  return [
    {
      title: 'Home',
      href: '/',
    },
    {
      title: 'Product',
      href: '/produk',
      submenu: categories.map((cat) => ({
        title: cat.name,
        href: cat.href,
      })),
    },
    {
      title: 'About',
      href: '/about',
    },
    {
      title: 'Platform',
      href: undefined,
      submenu: [
        {
          title: 'Shopee',
          href: 'http://shopee.co.id/eshade.clo',
          external: true,
        },
        {
          title: 'Tokopedia',
          href: 'https://www.tokopedia.com',
          external: true,
        },
        {
          title: 'Facebook',
          href: 'https://facebook.com',
          external: true,
        },
        {
          title: 'Instagram',
          href: 'https://www.instagram.com/eshade.officialshop/',
          external: true,
        },
      ],
    },
    {
      title: 'Contact',
      href: undefined,
    },
    {
      title: 'S&K',
      href: '/syarat-dan-ketentuan',
    },
  ];
};

// Default menu links (fallback if categories not loaded yet)
const menuLinks = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'Product',
    href: '/produk',
    submenu: [],
  },
  {
    title: 'About',
    href: '/about',
  },
  {
    title: 'Platform',
    href: undefined,
    submenu: [
      {
        title: 'Shopee',
        href: 'http://shopee.co.id/eshade.clo',
        external: true,
      },
      {
        title: 'Tokopedia',
        href: 'https://www.tokopedia.com',
        external: true,
      },
      {
        title: 'Facebook',
        href: 'https://facebook.com',
        external: true,
      },
      {
        title: 'Instagram',
        href: 'https://www.instagram.com/eshade.officialshop/',
        external: true,
      },
    ],
  },
  {
    title: 'Contact',
    href: undefined,
  },
  {
    title: 'S&K',
    href: '/syarat-dan-ketentuan',
  },
];

export default menuLinks;
