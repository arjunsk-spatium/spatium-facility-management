<template>
    <div class="default-layout">
        <header>
            <nav>
                <NuxtLink to="/tenants">Tenants</NuxtLink> |
                <NuxtLink to="/modules">Modules</NuxtLink> |
                <NuxtLink to="/plans">Plans</NuxtLink>
            </nav>
        </header>
        <main>
            <slot />
        </main>
    </div>
</template>

<style scoped>
.default-layout {
    padding: 20px;
}

header {
    margin-bottom: 20px;
    border-bottom: 1px solid #ccc;
    padding-bottom: 10px;
}
</style>
