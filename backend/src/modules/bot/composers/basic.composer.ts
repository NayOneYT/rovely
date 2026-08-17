import { Composer, Keyboard } from "grammy"
import { botService } from "../bot.service.js"

export const basicComposer = new Composer()

basicComposer.command("start", async (ctx) => {
  const isPhoneLinked = await botService.checkLink(ctx.from!.id)
  if (!isPhoneLinked) {
    const keyboard = new Keyboard()
    keyboard.requestContact("📱Отправить номер телефона").resized()
    ctx.reply(
      "Для продолжения отправьте свой номер телефона нажав на кнопку ниже:",
      { reply_markup: keyboard }
    )
  } else {
    ctx.reply("Ваш номер телефона уже привязан к этому чату")
  }
})

basicComposer.on("message:contact", async (ctx) => {
  const isPhoneLinked = await botService.checkLink(ctx.from.id)
  if (!isPhoneLinked) {
    if (ctx.from.id === ctx.message.contact.user_id) {
      const phone = ctx.message.contact.phone_number.startsWith("+")
        ? ctx.message.contact.phone_number
        : `+${ctx.message.contact.phone_number}`
      await botService.saveLink(phone, ctx.from.id)
      ctx.reply(
        `Теперь номер телефона ${phone} привязан к этому чату`,
        { reply_markup: { remove_keyboard: true } }
      )
    } else {
      ctx.reply("Это не ваш номер телефона 😐")
    }
  }
})