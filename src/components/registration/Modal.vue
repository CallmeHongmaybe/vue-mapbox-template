<template>
    <div className="modal__wrapper">
        <div className="modal">
            <slot />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.modal {
    width: 50%;
    height: 50%;
    background-color: white;
    padding: 20px 20px;
    z-index: 1200;
    display: flex;
    justify-content: center;
    align-items: center;

    &__wrapper {
        background-color: rgba(0, 0, 0, 0.4);
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        position: fixed;
        z-index: 1000;
        top: 0;
        left: 0;
    }
}
</style>
