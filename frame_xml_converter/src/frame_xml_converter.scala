import scala.xml._
import java.io.File
import scala.collection.mutable.ListBuffer
import java.io.FileOutputStream
import java.nio.channels.Channels

object frame_xml_converter extends App {

  val Encoding = "UTF-8";
  var files = new File("res/quer_xml/").listFiles.filter(_.getName.endsWith(".xml"));

  val convert = makeFrames(files);
  //println(convert);

  save(convert, "res/test2.xml");

  def makeFrames(files: Array[java.io.File]): Elem = {
    var frameList = ListBuffer[Elem]();
    files.foreach { file =>
      //println(file.getName())
      // TODO right now bounding boxes are not removed on empty frames
      var frame_no = file.getName().substring(0, 5)
      if (Integer.parseInt(frame_no) % 2 == 0) {
      if (frame_no.startsWith("0")) frame_no = frame_no.substring(1,5)
      //println(frame_no);
      val data = XML.loadFile(file);
      data.child.foreach { box =>
        if (box.label.equalsIgnoreCase("boundingbox")) {
          frameList += makeFrame(frame_no, box);
          //println("label:" + box.label);
        }
      }
      }
    } // close files.foreach
    var frames = Elem(null, "frames", scala.xml.Null, scala.xml.TopScope, frameList.toList: _*);
    return frames;
  }

  def makeFrame(id: String, node: Node) = {
    <frame id={ id }>{ node }</frame>
  }

  def save(node: Node, fileName: String) = {

    val pp = new PrettyPrinter(80, 2)
    val fos = new FileOutputStream(fileName)
    val writer = Channels.newWriter(fos.getChannel(), Encoding)

    try {
      writer.write("<?xml version='1.0' encoding='" + Encoding + "'?>\n")
      writer.write(pp.format(node))
    } finally {
      writer.close()
    }
    fileName
  }
}