<script setup lang="ts">

</script>

<template>
  <div class="focus">
    <div class="focus--mask">
      <div class="focus--mask-inner">
        <slot></slot>
      </div>
    </div>
  </div>
<slot></slot>
</template>

<style scoped lang="scss">

$componentSize: 15rem;
$maskSize: 4rem;
$speed: 1s;
$borderOffset: 8px;

$backgroundColor: #89cb66;
$animationProps: $speed linear infinite alternate;

@keyframes mask-move {
  0%   {
    transform: translateX(0);
  }
  100% {
    transform: translateX($componentSize - $maskSize);
  }
}

@keyframes mask-inner-move {
  0%   {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-($componentSize - $maskSize));
  }
}

.focus {
  font-size: 3rem;
  text-transform: uppercase;
  color: black;
  letter-spacing: .2rem;
  line-height: 1;
  position: relative;
  width: $componentSize;
  &:before {
    content: 'Fssss';
    filter: blur(3px);
  }
  &:after {
    content: '';
    position: absolute;
    width: $maskSize;
    height: calc(100% + #{$borderOffset});
    top: -($borderOffset / 2);
    left: 0;
    border-top: 2px solid;
    border-bottom: 2px solid;
    animation: mask-move $animationProps;
  }
  &--mask {
    overflow: hidden;
    position: absolute;
    width: $maskSize;
    height: 100%;
    top: 0;
    left: 0;
    background: $backgroundColor;
    animation: mask-move $animationProps;
    &-inner {
      animation: mask-inner-move $animationProps;
    }
  }
}

</style>