<template>
  <div class="swiper-container" id="floor1Swiper">
    <div class="swiper-wrapper" ref="cur">
      <div
        class="swiper-slide"
        v-for="(carousel, index) in list"
        :key="carousel.id"
      >
        <img :src="carousel.imgUrl" />
      </div>
    </div>
    <!-- 如果需要分页器 -->
    <div class="swiper-pagination"></div>

    <!-- 如果需要导航按钮 -->
    <div class="swiper-button-prev"></div>
    <div class="swiper-button-next"></div>
  </div>
</template>

<script>
import Swiper from "swiper";
export default {
  name: "Carousel",
  props: ["list"],
  watch: {
    //监听bannerList数据的变化：因为这条数据发生过变化---由空数组变为数组里面有四个元素
    bannerList: {
      immediate: true,
      handler(newValue, oldValue) {
        //watch监听bannerList值的变化
        //如果执行handler方法，代表组件实例身上这个属性的属性已经有了
        //当前这个函数执行，只能保证bannerList数据已经有了，但是你没办法保证v-for已经执行结束了
        //v-for执行完毕，才有结构【现在在watch当中没办法保证的】
        // nextTick:在下次DOM更新  循环结束之后 执行延迟函数。  在 修改数据之后  立即使用这个方法 获取更新后的DOM
        this.$nextTick(() => {
          var mySwiper = new Swiper(".swiper-container", {
            loop: true,
            pagination: {
              el: ".swiper-pagination",
              clickable: true,
            },
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            },
          });
        });
      },
    },
  },
};
</script>

<style>
</style>