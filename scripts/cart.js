"use strict";

class Cart {
    constructor(source, container = '#cart') {
        this.source = source;
        this.container = container;
        this.amount = 0;
        this.countGoods = 0;
        this.cartItems = [];
        this._init(this.source);
    }

    _init(source) {
        this._render();
        if(!localStorage.getItem('cart')) {
            fetch(source)
                .then(result => result.json())
                .then(data => {
                    for (let product of data.cartProducts) {
                        this.cartItems.push(product);
                        this.countGoods += +product.quantity;
                        this._renderItem(product)
                    }

                    localStorage.setItem('cart', JSON.stringify(this.cartItems));
                    localStorage.setItem('countGoods', this.countGoods);
                    localStorage.setItem('amount', this.amount);

                    this._renderTotal();
                    this._renderCount();
                });
        } else {
            this.cartItems = JSON.parse(localStorage.getItem('cart'));
            for (let product of this.cartItems) {
                this._renderItem(product);
            }

            this.countGoods = +localStorage.getItem('countGoods');
            this.amount = +localStorage.getItem('amount');

            this._updateTotal();
            this._renderTotal();
            this._renderCount();
        }

        $('#cart').on('click', '.action', event => {
            this._removeProduct(event.target);
        });

        $('#clear-all').click(() => {
            this._removeAll();
        });
    }

    _render() {
        let $cartItemsContainer = $('<table/>', {
            class: 'products-table container'
        });

        let $cartHeadRow = $(
            `<tr>
            <th>Product Details</th>
            <th>Unit Price</th>
            <th>Quantity</th>
            <th>Shipping</th>
            <th>Subtotal</th>
            <th>ACTION</th>
        </tr>`
        );

        $cartHeadRow.appendTo($cartItemsContainer);
        $cartItemsContainer.appendTo($(this.container));
    }

    _renderItem(product) {
        let $container = $('<tr/>', {
            class: 'cart-item',
            'data-product': product.id
        });

        let $title = $(
            `<td>
            <a class="prod-info transform_scale" href="single-page.html"><img class="cart-product-image" src="${product.img}" alt="product">
            <h4 class="product-cart-name">${product.name}</h4>
            <p class="prod-det"><span>Color: </span>${product.color}</p>
            <p class="prod-det"><span>Size: </span>${product.size}</p>
            </a>
            </td>`
        );

        let $price = $(`<td>&#36;&nbsp;${product.price}</td>`);
        let $quantity = $(`<td><input class="prod-quantity" type="number" value="${product.quantity}" 
            name="quant"></td>`);
        let $shipping = $(`<td>${product.shipping}</td>`);

        let subtotal = this._calculateSubtotal(product, $quantity);
        let $subtotal = $(`<td>&#36;&nbsp;${subtotal}</td>`);
        this.amount += subtotal;

        $quantity.find('input').on('input', () => {
            if ($quantity.children().val() < 1) {
                $quantity.children().val(1)
            }

            $subtotal.text(`$ ${this._calculateSubtotal(product, $quantity)}`);

            localStorage.setItem('cart', JSON.stringify(this.cartItems));

            this._updateTotal();
        });

        let $removeButtonElement = $(`<td><i class="fas fa-times-circle action" 
            data-id="${product.id}"></i></td>`);

        $container.append($title);
        $container.append($price);
        $container.append($quantity);
        $container.append($shipping);
        $container.append($subtotal);
        $container.append($removeButtonElement);

        $container.appendTo($('.products-table'));
    }

    _updateTotal() {
        this.amount = 0;
        this.countGoods = 0;
        for (let item of this.cartItems) {
            this.amount += +item.quantity * +item.price;
            this.countGoods += +item.quantity;
        }

        localStorage.setItem('countGoods', this.countGoods);
        localStorage.setItem('amount', this.amount);

        this._renderTotal();
        this._renderCount();
    }

    _calculateSubtotal(product, $quantity) {
        product.quantity = $quantity.children().val();
        return product.quantity * product.price;
    }

    _renderTotal() {
        $('#subtotal').text(`$ ${this.amount}`);
        $('#grand-total').text(`$ ${this.amount}`);
    }

    _removeProduct(btn) {
        let productID = +$(btn).data('id');
        let find = this.cartItems.find(product => product.id === productID);
        this.cartItems.splice($.inArray(find, this.cartItems), 1);
        $(btn).parents('tr').remove();

        localStorage.setItem('cart', JSON.stringify(this.cartItems));

        this._updateTotal();
    }

    _removeAll() {
        $('.cart-item').remove();

        this.cartItems = [];

        localStorage.setItem('cart', JSON.stringify(this.cartItems));

        this._updateTotal();
    }

    _renderCount() {
        const $goodsNumContainer = $('.goods-number');
        if (this.countGoods > 0) {
            $goodsNumContainer.css("background-color", "#f16d7f");
            $goodsNumContainer.text(this.countGoods);
        } else {
            $goodsNumContainer.css("background-color", "transparent");
            $goodsNumContainer.text('');
        }
    }
}