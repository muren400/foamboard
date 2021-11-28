export default class Splitter {
    constructor(splitterDiv) {
        this.splitterDiv = splitterDiv;
        this.parentContainer = this.splitterDiv.parentElement;
        this.prevPanel = this.splitterDiv.previousElementSibling;
        this.nextPanel = this.splitterDiv.nextElementSibling;

        this.splitterDiv.style.backgroundColor = window.getComputedStyle(this.nextPanel, null).getPropertyValue('background-color');

        this.dragging = false;

        this.splitterDiv.addEventListener('mousedown', (e) => {
            this.dragging = true;
        });

        window.addEventListener('mouseup', (e) => {
            this.dragging = false;
        });

        document.addEventListener('mouseleave', (e) => {
            this.dragging = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (this.dragging !== true) {
                return;
            }

            this.resize(e);
        });

        this.resize();
    }

    resize(e) {
        if (this.splitterDiv.classList.contains('left-splitter')) {
            this.moveLeft(e);
        } else if (this.splitterDiv.classList.contains('bottom-splitter')) {
            this.moveBottom(e);
        }

        if (e != null && typeof this.onResize === 'function') {
            this.onResize();
        }
    }

    moveLeft(e) {
        if (this.splitterPosition == null) {
            this.splitterPosition = this.nextPanel.clientWidth;
        }

        if (this.prevPanel.style.display === 'none') {
            this.nextPanel.style.width = '100%';
            return;
        }

        if (this.nextPanel.style.display === 'none') {
            this.prevPanel.style.width = '100%';
            return;
        }

        const movementX = e == null ? 0 : e.movementX;
        const parentWidth = this.parentContainer.clientWidth;
        this.splitterPosition -= movementX;
        this.nextPanel.style.width = this.splitterPosition;

        this.prevPanel.style.width = parentWidth - this.splitterPosition - this.splitterDiv.clientWidth;
    }

    moveBottom(e) {
        if (this.splitterPosition == null) {
            this.splitterPosition = this.nextPanel.clientHeight;
        }

        if (this.prevPanel.style.display === 'none') {
            this.nextPanel.style.height = '100%';
            return;
        }

        if (this.nextPanel.style.display === 'none') {
            this.prevPanel.style.height = '100%';
            return;
        }

        const movement = e == null ? 0 : e.movementY;
        const parentHeight = this.parentContainer.clientHeight;
        this.splitterPosition -= movement;
        this.nextPanel.style.height = this.splitterPosition;

        this.prevPanel.style.height = parentHeight - this.splitterPosition - this.splitterDiv.clientHeight;
    }

    hideLeft() {
        this.nextPanel.style.display = 'none';
        this.splitterDiv.style.display = 'none';

        this.prevPanel.style.width = '100%';

        this.onResize();
    }

    showLeft() {
        this.nextPanel.style.display = 'block';
        this.splitterDiv.style.display = 'block';

        this.resize({ movementX: 0, movementY: 0 });
    }
}