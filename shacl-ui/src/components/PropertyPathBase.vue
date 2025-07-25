<template>
  <div class="flex items-start gap-4">
    <!-- Left column: Field name -->
    <div class="w-48 flex-shrink-0">
      <div class="text-xs text-gray-500">
        <slot name="path-type" />
      </div>
      <div class="font-semibold text-sm">
        <slot name="path-label" />
      </div>
    </div>

    <!-- Right column: Input fields -->
    <div class="flex-1">
      <slot name="value-nodes" />
    </div>
  </div>
</template>
