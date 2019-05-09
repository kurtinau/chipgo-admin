export default {
    items: [
        {
            name: 'Dashboard',
            url: '/dashboard',
            icon: 'icon-speedometer',
            badge: {
                variant: 'info',
                text: 'NEW',
            },
        },
        {
            name: 'Catalog',
            url: '/catalog',
            icon: 'icon-tag',
            children: [
                {
                    name: 'Categories',
                    url: '/catalog/categories',
                },
                {
                    name: 'Products',
                    url: '/catalog/products',
                },
            ],
        },
        {
            name: 'Sales',
            url: '/sales',
            icon: 'icon-basket',
            children: [
                {
                    name: 'Orders',
                    url: '/sales/orders',
                },
                {
                    name: 'Invoices',
                    url: '/sales/invoices',
                },
            ],
        },
        {
            name: 'Customers',
            url: '/customers',
            icon: 'icon-people'
        },
        {
            name: 'Pages',
            url: '/pages',
            icon: 'icon-star',
            children: [
                {
                    name: 'Login',
                    url: '/login',
                    icon: 'icon-star',
                },
                {
                    name: 'Register',
                    url: '/register',
                    icon: 'icon-star',
                },
                {
                    name: 'Error 404',
                    url: '/404',
                    icon: 'icon-star',
                },
                {
                    name: 'Error 500',
                    url: '/500',
                    icon: 'icon-star',
                },
            ],
        }
    ],
};
