"use strict";

class Products {
    constructor(source, container = '#products') {
        this.source = source;
        this.container = container;
        this.productItems = [];
        this._init(this.source);
    }

    _init(source) {
        fetch(source)
            .then(result => result.json())
            .then(data => {
                let productsArr,
                    $bodyData = $('body').data('page');

                if ($bodyData === 'products') {
                    productsArr = data.products;
                } else if ($bodyData === 'single-product') {
                    productsArr = data.pageProducts;
                } else if ($bodyData === 'index') {
                    productsArr = data.indexProducts;
                }

                for (let product of productsArr) {
                    this.productItems.push(product);
                    this._renderProduct(product)
                }
            });
    }

    _renderProduct(product) {
        let $productContainer = $('<div/>', {
                class: 'product-index'
            }),
            $productLink = $('<a/>', {
                class: 'product-a',
                href: product.link
            }),

            $productImg = $('<img/>', {
                class: 'product-img',
                src: product.img,
                alt: 'product-image'
            }),

            $productName = $(`<p class="name-item">${product.name}</p>`),
            $productPrice = $(`<p class="price-item">&#36;&nbsp;${product.price}</p>`),

            $addButton = $(
                `<div class="add-flex"><a href="#" class="add-to-cart add-cart">Add to Cart</a></div>`
            );

        $addButton.find('a').attr('data-id', product.id);
        $addButton.find('a').attr('data-img', product.img);
        $addButton.find('a').attr('data-name', product.name);
        $addButton.find('a').attr('data-color', product.color);
        $addButton.find('a').attr('data-size', product.size);
        $addButton.find('a').attr('data-price', product.price);
        $addButton.find('a').attr('data-quantity', product.quantity);
        $addButton.find('a').attr('data-shipping', product.shipping);
        $addButton.find('a').attr('data-link', product.link);

        $productLink.append($productImg);
        $productLink.append($productName);
        $productLink.append($productPrice);

        $productLink.appendTo($productContainer);
        $addButton.appendTo($productContainer);

        $productContainer.appendTo(this.container);
    }
}