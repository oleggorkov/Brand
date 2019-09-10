"use strict";

class Comment {
    constructor(source, container = '#comments', form = '#my-form') {
        this.source = source;
        this.container = container;
        this.form = form;
        this.comments = [];
        this.curID = 0;
        this.inputsArr = this._getInputs();
        this._init(this.source);
        this._checkForm();
    }

    _init(source) {
        fetch(source)
            .then(result => result.json())
            .then(data => {
                this.curID = data.maxID;
                for (let comment of data.comments) {
                    this.comments.push(comment);
                    this._renderComment(comment);
                }

            });
    }

    _initForm() {
        let $author = $('#name').val(),
            $comment = $('#feedback').val();

        let comment = {
            id: ++this.curID,
            author: $author,
            text: $comment,
            approved: false
        };

        this.comments.push(comment);
        this._clearForm();
        this._renderComment(comment);
    }

    _renderComment(comment) {
        let $wrapper = $('<div/>', {
            class: 'comment',
            'data-id': comment.id
        });
        let $author = $(`<h3 class="author">${comment.author}</h3>`);
        let $text = $(`<p class="text">${comment.text}</p>`);
        let $delBtn = $(`<button class="remove-btn btn btn-secondary">Reject</button>`);
        $wrapper.append($author);
        $wrapper.append($text);
        $wrapper.append($delBtn);
        $delBtn.click(() => {
            this._remove(comment.id);
        });
        if (!comment.approved) {
            let $approve = $(`<button class="approve-btn btn btn-primary">Approve</button>`);
            $wrapper.append($approve);
            $wrapper.addClass('not-approved');
            $approve.click(() => {
                this._approve(comment.id);
            });
        } else {
            $wrapper.addClass('approved');
        }
        $(this.container).append($wrapper);
    }

    _approve(id) {
        let find = this.comments.find(comment => comment.id === id);
        $(`.comment[data-id="${id}"]`)
            .addClass('approved')
            .removeClass('not-approved')
            .find('.approve-btn')
            .remove();
        find.approved = true;
    }

    _remove(id) {
        let find = this.comments.find(comment => comment.id === id);
        this.comments.splice(this.comments.indexOf(find), 1);
        $(`.comment[data-id="${id}"]`).remove();
    }

    _getInputs() {
        return [
            {
                inputTag: document.querySelector('[name = "name"]'),
                pattern: /^[a-zа-я\s]+$/i,
                isInvalid: false
            },
            {
                inputTag: document.querySelector('[name = "text"]'),
                pattern: /.+/,
                isInvalid: false
            }];
    }

    _checkForm() {
        $(this.form).submit(event => {
            event.preventDefault();
        });

        const namesArr = [];
        const elemArr = document.querySelectorAll(".form-control");
        const sendButton = document.getElementById('submit-btn');
        for (const element of elemArr) {
            namesArr.push(element.getAttribute("name"));
        }

        sendButton.addEventListener('click', event => {
            for (let i = 0; i < namesArr.length; i++) {
                const currentInput = namesArr[i];

                const problemFound = !this._checkElement(currentInput);

                if (problemFound) {
                    event.preventDefault();
                }

                if (problemFound && !this.inputsArr[i].isInvalid) {
                    this._createInvalidMessage(currentInput, i);
                }

                if (!problemFound) {
                    this._createValidMessage(currentInput, i);
                }

                this._watchField(elemArr[i], currentInput, i);
            }

            if (this._isReady()) {
                this._initForm();
            }
        });
    }

    _clearForm() {
        $(this.form)[0].reset();
        $('.form-control').css("border-color", "#ced4da");
    }

    _watchField(field, name, idx) {
        field.addEventListener('input', () => {
            if (this.inputsArr[idx].pattern.test(field.value)) {
                this._createValidMessage(name, idx);
            } else {
                if (field.parentNode.lastChild.nodeName !== 'DIV') {
                    this._createInvalidMessage(name, idx);
                }
            }
        });
    }

    _checkElement(name) {
        switch (name) {
            case "name":
                const nameValue = this.inputsArr[0].inputTag.value;
                return this.inputsArr[0].pattern.test(nameValue);
            case "text":
                const textValue = this.inputsArr[1].inputTag.value;
                return this.inputsArr[1].pattern.test(textValue);
        }
    }

    _createInvalidMessage(name, idx) {
        const invalidElement = document.querySelector(`[name = "${name}"]`);
        const invalidDivMessage = document.createElement("DIV");
        invalidDivMessage.dataset.invalid = "true";
        invalidDivMessage.style.color = "#f16d7f";
        invalidElement.style.borderColor = "#f16d7f";
        this.inputsArr[idx].isInvalid = true;

        switch (name) {
            case "name":
                invalidDivMessage.textContent = "The name can contain only letters.";
                break;
            case "text":
                invalidDivMessage.textContent = "Please, write a feedback.";
                break;
        }

        invalidElement.parentElement.appendChild(invalidDivMessage);
    }

    _createValidMessage(name, idx) {
        const validElement = document.querySelector(`[name = "${name}"]`);
        validElement.style.borderColor = "green";
        if (this.inputsArr[idx].isInvalid) {
            validElement.parentElement.querySelector('[data-invalid="true"]').remove();
            this.inputsArr[idx].isInvalid = false;
        }
    }

    _isReady() {
        for (let i = 0; i < this.inputsArr.length; i++) {
            if (this.inputsArr[i].isInvalid) {
                return false;
            }
        }

        return true;
    }
}

